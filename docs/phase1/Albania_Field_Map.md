# Albania → Atlas master field map

Documentation contract v1, against main **5f46f9b03f24f4776ffb09feb390906b0ca75fdb** (post–PR #17), checked 2026-09-16. Governing sources: [accepted plan](https://github.com/FTFNAnalytics/digitaldemocracy/blob/5f46f9b03f24f4776ffb09feb390906b0ca75fdb/docs/atlas-plan.md), Prompt B migrations/rationale/checklist, frozen package, and Phase 0 classification draft. Locked decisions remain unchanged. No application/importer code or research rows are supplied here.

**Readiness caveat:** `schemas/atlas/tiers/albania.json` is absent on this main. Available Phase 0 `albania/tier-classification.json` has SHA-256 `9d6c74454e7454acbebab3606aec4998c3346e12107a3077cfe22de607471081` and status `draft_for_human_review`. Its 122 municipal assignments support this map but are not silently approved. Actual Phase 1 import requires the canonical checked-in file, accepted with `status: "approved"`; preserve all classification rows and source-register hash, review flags and rationale. Hash the accepted bytes anew. Missing file is a durable failed attempt, never an empty tier table. This is an explicit implementation prerequisite, not an open-ended audit or a request to reopen Phase 1.

The two SQL drafts remain unchanged. Every column below has a mapping, including operational fields and columns in intentionally empty tables. [Identity rules](Albania_Identity_Rules.md) define all referenced key functions; [acceptance examples](Albania_Acceptance_Examples.md) are future CI specifications, not executed importer tests.

## Baseline

| Count name in validated_counts_json | Required value |
| --- | ---: |
| current_offices | 122 |
| historical_offices | 0 |
| geographies | 122 |
| selected_histories | 366 |
| result_rows | 3843 |
| control_observations_retained | 45 |
| national_polls_retained | 1 |
| source_catalogue_rows | 182 |
| inline_only_sources | 3 |
| sources | 185 |
| briefings_retained | 122 |
| municipal_offices | 122 |
| regional_offices | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| package_files_retained | 163 |

Register SHA-256 must equal **7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62**. Validate counts by ID/value equality, not just totals. Source catalogue count is not the canonical-source total after three genuine inline additions. Baseline events all have day precision; next polling date is unknown for every office. There are 399 NULL seats and 1,876 recorded zero seats; all baseline vote/share cells are positive and nonnull.

## Source notation and lossless envelope

`P = data/countries/albania/`. Prefix P to every relative path below. Bracketed column names are literal workbook column names, not inferred JSON properties. For a table file `F`, column `c`, row index `i`: the JSON cell pointer is `/rows/i/j`, where `j` is the unique exact index of `c` in `/columns`; original workbook row is `/source_rows/i`, sheet is `/sheet`. `i` and `j` are zero-based JSON indices; source_rows is the supplied workbook row number and must not be reconstructed as i+2 across shards.

| Alias | Exact file / sheet |
| --- | --- |
| M | P/manifest.json, top-level keys |
| O | P/tables/office-register.json, Office register |
| H | P/tables/history-index-001.json and -002.json, History index, lexical file order then rows order |
| D | P/tables/detailed-returns-001.json through -021.json, Detailed returns, lexical file order then rows order |
| S | P/tables/sources.json, Sources |
| Nts | P/tables/country-notes.json, Country notes |
| Cal | P/tables/election-calendar.json, Election calendar |
| Ctl | P/tables/governing-control.json, Governing control |
| Poll | P/tables/polling-evidence.json, Polling evidence |
| BF | P/briefings/{exact Office ID}.html; inert HTML source |
| T | schemas/atlas/tiers/albania.json, classifications[]; canonical file currently missing |

Other exact retained JSON inputs: P/coverage.json, P/source-links.json, P/history-index-crosscheck.json, P/cached-formulas.json, P/tables/country-coverage.json, P/tables/parameters.json, P/tables/read-me.json. Retain P/albania.html, every BF, P/README.md, P/extract.py and P/validate.py as original bytes; ingestion does not execute them. All 163 tracked package files are fingerprinted, including four outside manifest.files. Original archive/workbook hashes in manifest.source_inputs are provenance/recovery metadata, not extra projected rows or an instruction to load all Europe.

**Locator object:** `{input_path, sha256, json_pointer, sheet, source_row, column, html_anchor_index}` with unused keys explicitly null. HTML anchors use zero-based document-order `<a>` index; h3 selectors use zero-based h3 index and raw heading text in the envelope. For inherited path collisions, add `retained_input_path` to the locator envelope to name the actual retained_input key; `input_path` remains the original source path. An occurrence identity is `[original_input_path, sheet, source_row, column, json_pointer, html_anchor_index]`; on later rebinding keep the original binding and place current physical location in raw metadata. Do not include mutable bytes/hash or release ID in stable occurrence identity.

**Raw envelope:** `{origin: locator, row: <original row object>, columns: <original columns array>, values: <original row array>, supplemental: <original supporting objects/HTML extracts>}`. `row` is exact zipped source values; no normalized values are substituted. Non-tabular origin uses `row` equal to original JSON object and columns/values null. Supplemental items have their own locator. Unprojected files remain whole in retained_input. The original byte stream remains recoverable by hash even if the envelope is reserialized. Operations such as approval, identity bindings and override decisions are labelled operational metadata, distinct from source claims.

**Common null policy:** JSON null stays SQL NULL unless a required status explicitly records unknown. Missing required identity/country/citation target is an error. No NaN, Infinity, numeric-string guessing, whitespace rewriting of IDs, or Unicode normalization. Optional blank strings become NULL only for typed optional scalar fields, with the exact original value retained raw; ID blanks fail. Every FK is checked with foreign_keys=ON and foreign_key_check empty. Every source reference carries original occurrence provenance.

## dataset_lineage

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + bridge packageRelease | Fixed `country-package-albania`; never a per-run ID. | L; PK | One source-dataset lineage, not one continent. |
| provenance_kind | M.schema_version | `country_package`; require `europe-country-extract/1`. | L | Reject fixture/unknown provenance. |
| description | M.country | `Albania frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | All P files + T + applicable override files + version contract | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-albania-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_checked_through | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Not today or attempt timestamp. |
| upstream_release_id | europe.ts packageRelease(inventory).id | Copy existing `country-package-albania`. | R | Legacy alias retained; not new Atlas release ID. |
| validated_counts_json | Recomputed O/H/D/S/C/Poll/BF counts | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | Required counts and per-office semantic equality; catalogue vs inline counts distinct. |
| research_coverage_complete | M.coverage_complete | false → 0; require false for this frozen baseline. | R | Do not turn successful validation into complete coverage. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve pending_adapter; not publication status. |

## retained_input

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | Every tracked file below P; accepted T; applicable overrides | Repo-relative POSIX path, no leading slash, traversal or symlink. Inherited path rule in Identity Rules. | (L,R,input_path) | 163 baseline package files + 1 accepted tier file; inventory may grow only by explicit inputs. |
| input_kind | Path class | T=tier_classification; overrides=override; *.html=artifact; every other P file=package. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | Verify manifest.files hashes for all 159 listed entries and register fixed hash. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | `sha256:<sha256>` content-addressed locator; fetch/store bytes before publication; git commit/path also retained in inventory. | (L,R,input_path) | Resolve and rehash every locator; scratch/working-tree existence alone is insufficient. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | Full structural equality and original-byte recovery; 45 control + 1 poll retained. |

## country

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | M.country; bridge slug | Literal `albania`, existing ID. | country_id | No new country from shared Read me text. |
| country_code | M.country_code | Copy `AL`. | country_id | Unique if supplied; NULL allowed for future entries. |
| name | M.country | Copy `Albania`. | country_id | Nonempty. |
| polity_kind | M.country / country_code; accepted plan | `sovereign_country` for Albania. | country_id | Do not impose this value on territories. |
| region_id | M.region | Europe → `europe`; geographic region, not office tier. | country_id | Not calendar cohort. |
| coverage_status | M.coverage_complete; coverage.json.status | `partial`. | country_id | Coverage notes remain available. |
| screening_as_of_label | No separate Albania screening-as-of field | NULL; research_checked_through belongs to release. | country_id | Do not infer from Accessed or packaged_on. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Retain unconfirmed reform, missing officeholders, certification limits. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `albania`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction + O.Office + bridge key | G=key("geo",["albania",Jurisdiction,Office]); frozen bindings retained thereafter. | (country_id,G) | 122 distinct bridge IDs; names are not PKs. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No inferred qark/municipality parents; future FK same country and acyclic. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row for this G | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | 122 unique IDs; fixture patterns rejected. |
| country_id | O.Country + M.country | `albania`; exact Albania label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N,office_id) | FK (albania,G); no collapsing mayor/council geography. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O.Office | Verbatim `Mayor` or `Municipal council`. | (N,office_id) | 61 each; separate from geographic tier. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date; Cal.First or scheduled date / End or runoff date | NULL for all 122; all cells null. No narrative reform year promotion. | (N,office_id) | If later uniquely sourced date exists, date FK; conflict pointer NULL. |
| next_date_resolution | Same date inputs | `unknown` for all 122. | (N,office_id) | No called date from broad Date status text. |
| next_history_key | No public upcoming event in this bridge baseline | NULL. | (N,office_id) | Do not create key("next",office_id) absent supplied date/event. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | municipal→municipal; national→national_context; regional/other unchanged; unknown→NULL. | (N,office_id) | 122 municipal; zero regional; ignore calendar Tier entirely. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | Known tier: approved only if accepted T.status="approved" and neither row flag true; otherwise needs_review. Unknown tier→unknown. | (N,office_id) | Available draft remains needs_review; absence of row warning is not approval. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/albania.json`. | (N,office_id) | Must exist and be retained; do not claim draft scratch path is checked in. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Accepted T bytes | Hash actual accepted bytes; draft checksum not automatically accepted checksum. | (N,office_id) | Exact composite retained-input FK and row-level provenance. |
| raw_json | T.classifications[] original object | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| date_id | H owner identity + date slot; later documented date claims | `date-` + full SHA256(C([N,owner_type,owner_id,slot])); event owner_id=event_id, slot=ballot. | date_id | Stable across corrected value; each distinct claim has its own owner/slot. |
| label | H.Ballot date if recorded, else H.Year | Use supplied date label verbatim; if absent, decimal year; if both absent, empty string with unknown precision. | date_id | No fabricated "Date not supplied" as source text; original null preserved raw. |
| precision | Label grammar in § Dates | Known valid ISO/English date→day/month/year; empty/unparseable→unknown; explicit pair→range. Baseline 366 day. | date_id | No truncation of qualifiers, invented day or midnight. |
| certainty | No historical called/statutory/expected assertion | `unknown` for 366 historical dates. Future claims require explicit certainty mapping; no URL-based inference. | date_id | Independent of precision and legal outcome. |
| year | Parsed exact date/year label | Integer 1..9999; NULL if unknown or range. | date_id | All baseline years agree with H.Year. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; deterministic child date owner slot range_start if supplied later. | date_id | FK known non-range endpoint, acyclic. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; analogous range_end. | date_id | FK and ordered intervals; never interpret two separate elections as runoff range. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H original date/year cells + their locator | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## election_event

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | H.Office ID identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H.Office ID | Copy exact. | (N,office_id,history_key) | FK office; every H row resolves. |
| history_key | H.Office ID / Year / Ballot date if recorded | Bridge HK exact rule in Identity Rules; preserve frozen binding on corrections. | (N,office_id,HK) | 366 unique; crosscheck slice adds zero. |
| event_id | Bridge key("event",["albania",HK]) | Exact bridge public ID; never hash raw result values. | (N,event_id) | Unique within namespace; alias crosswalk retained. |
| date_id | H date mapped to research_date | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | Required for resolved/unknown under DDL; NULL only unresolved conflicting claims. |
| date_resolution | Parsed H date + documented override state | `resolved` for baseline; unknown if unusable label, conflicting if neither dated claim wins. | (N,office_id,HK) | Resolved baseline has day date; conflicting requires NULL date_id. |
| event_kind | BF[Office ID].h3 for exact selected H ballot date | Ordinary election / Ordinary council election / Ordinary mayoral election→ordinary; Replacement mayoral election→special; Full repeat of annulled mayoral election→repeated. | (N,office_id,HK) | Unique heading match; 350 ordinary,15 special,1 repeated. Extra HTML histories not inserted. |
| selected_history_role | Membership in numbered H files | `selected` for all 366. | (N,office_id,HK) | Never promote crosscheck, extra HTML history, narrative annulment or prospective record. |
| electoral_system | No dedicated voting-system field in H | NULL; Vote basis is not an electoral system. | (N,office_id,HK) | No guessed FPTP/PR/See source briefing. |
| comparability | H.Coverage + H.Comparability status | Join nonempty exact strings with ` · `; raw keeps separate values. | (N,office_id,HK) | 2019 unscored/inapplicable remains explicit. |
| ballot_basis | H.Vote basis | Exact `Valid candidate/list votes`→valid_votes; other three baseline labels→unknown (denominator retained verbatim). | (N,office_id,HK) | Do not label mayor votes list_votes or marks unique voters; see conservative projection note. |
| share_unit | H.Leader share and D.Share on stated basis; BF Share heading | `percent_0_100`. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | H.Coverage | If explicit preliminary/provisional vote-vector status→preliminary; otherwise unknown. Separate winner certification narrative stays evidence, not blanket final vote certification. | (N,office_id,HK) | No invented proceeding/certification; Rrogozhinë repeat is not annulled just because its predecessor was. |
| record_state | Selected H membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row plus matched BF h3 locator/text | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## proceeding

**Baseline cardinality: zero.** The following documents why each destination column receives no row; it is not a template authorizing invented records.

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Albania package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| id_namespace | D.Office ID | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D.Office ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D.Office ID / Year / Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | All 3,843 rows match exactly one selected H. |
| result_row_id | Bridge per-event detailed-return order | `${event_id}-r${i}`; i zero-based in lexical shard order then physical rows order. Freeze baseline binding thereafter. | (N,result_row_id) | Never reassign index after sorting by votes or after refresh omission. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Country + matched office | `albania`. | (N,result_row_id) | Composite FK enforces office country. |
| candidate_or_list_label | D.Candidate or list | Exact string; NULL if absent, no invented Unlabelled source row. | (N,result_row_id) | All baseline supplied. |
| original_party_label | D.Party or proposer | Exact original text, including Nominating party not yet matched. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | Bridge result.partyCode = D.Party or proposer | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Not a new authoritative standardized party code. |
| party_namespace | D.Year + country package source scope | `albania/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Existing bridge namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 3,843 nonnull positive baseline counts; integer precision safe. |
| votes_status | D.Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | All baseline positive; independent of evidence_status. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 399 NULL; 1,876 zero. Do not infer mayor seat=1. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D.Result coverage | Case-insensitive preliminary/provisional→preliminary; otherwise recorded if votes/share supplied, else unknown. | (N,result_row_id) | Reported numbers stay numbers even when preliminary; no certification inference. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

**Baseline cardinality: zero.** The following documents why each destination column receives no row; it is not a template authorizing invented records.

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
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
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| country_id | S rows / exact inline URL occurrence | `albania`. | (albania,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-albania`. | (albania,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | S.Source ID; genuine inline URL | Catalogue `albania--` + Source ID; inline-only `albania--` + key("url",exact URL). | Source tuple | 182 catalogue + 3 inline-only =185; exact URL aliases crosswalk to catalogue. |
| publisher | No dedicated publisher column in S; inline context lacks explicit publisher metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S.Title | Verbatim for catalogue; NULL for three inline-only URLs (anchor labels are not asserted source titles). | Source tuple | No URL-as-title or manufactured Source reference title. |
| url | S.Source URL; genuine inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | Exact unique catalogue URL match; no fetching or claiming current availability. |
| checked_as_of_label | S.Accessed | Copy catalogue value; inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | S original row or inline URL occurrence list | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | albania except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | If later supplied, both mapping components required. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-albania for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator object) using exact definition below; table rows carry source_rows[i], JSON pointer, SHA and logical path. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | albania. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-albania. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | history→event; return→result; event date→date; control→control_observation; poll→national_poll; Cal/Nts/coverage→calendar_context; HTML-only→artifact_reference; explicit override→override. | evidence_id | No claim stronger than field context; see evidence traversal. |
| date_claim_id | H date claim or explicit documented date override | H ballot date ID only for claim_kind=date; otherwise NULL. Ancillary control/poll dates stay retained JSON. | evidence_id | FK actual research_date; independent conflicting dates preserved separately. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | `preserved_bridge_id`, `package_source_id`, `exact_url_catalogue_alias`, `baseline_row_binding`, or `documented_identity_correction`. | Crosswalk PK | Correction requires retained override; no undocumented reassignment. |
| lineage_id | Owning package M / staged lineage | `L = country-package-albania`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Albania row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined below, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination field | Source file / path or column | Conversion / null policy | Identity rule | Evidence / FK / validation assertion |
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
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Albania. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## schema_migration (both databases)

| Destination field | Source | Conversion/null | Identity | Assertion |
| --- | --- | --- | --- | --- |
| version | Respective Prompt B migration literal | 1, nonnull | PK 1 | Separate master and ledger; PRAGMA user_version=1 |
| description | Respective migration literal | Master: Atlas Phase 1 master draft; ledger: Atlas durable attempt ledger draft | version | No research input; do not change migration bytes in Prompt C |

## Dates

Use full-string matching, not arbitrary digits found in narrative: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, `D Month YYYY` or `Month YYYY` (English full month names case-insensitive). Four-digit year; ISO month/day exactly two digits. Leading/trailing whitespace may be ignored for parsing only; retain original label. Invalid purported dates fail validation; unrecognized narrative is unknown. A valid year fallback is allowed only when Ballot date if recorded is null/blank, never to conceal malformed supplied dates. Full date and Year must agree unless an explicit retained correction reconciles them. Qualifiers remain raw; only an explicit supplied certainty qualifies as called/statutory/expected/conditional. No text-wide matching of “official”, “2027 map”, or “expected” across unrelated rows.

For a later explicit range, retain separate endpoint date rows; endpoints must be known non-range values, acyclic and ordered. Compare interval bounds without storing invented endpoints: year covers that calendar year; month covers that calendar month. Unknown does not prove in-window. Baseline poll fieldwork dates stay in retained_input, not new election dates. The current package has no month/year-only selected event, no competing next-date claims and no next-date event. The acceptance document clearly separates synthetic precision tests from source facts.

## Evidence traversal and resolution

Create one typed locator for every projected country, geography, office, event, result and source, and every retained input. No date/tier locator kind exists: date claims target event/office; tier provenance uses its mandatory retained-input FK and the office locator when a real citation exists. Input locators permit multiple raw observations without inventing typed metric/officeholder/poll entities; claim_json and source_locator distinguish rows.

Resolve catalogue Source ID first by exact token, then exact catalogue URL. All 182 catalogue URLs are unique. Do not normalize paths, strip query strings, or collapse domains. Three genuine inline-only URLs in source-links.json.urls_without_master_source_row are:

- https://en.wikipedia.org/wiki/List_of_elections_in_2027
- https://kqz.gov.al/
- https://www.iri.org/resources/albania-survey-of-public-opinion-april-may-2026/

These become real source rows with absent metadata NULL, not unresolved tokens. Their availability on the web was not rechecked and is not claimed. No remote document is fetched to enrich frozen research.

| Citation input | Target and claim | Required handling |
| --- | --- | --- |
| H.Source URL | event locator; event and separate date claim | Preserve full H row and link its ballot research_date on date claim |
| D.Source URL | exact result locator; result | Do not assume event citation replaces each return's supplied URL |
| O.Calendar evidence | office locator; calendar_context, only if supplied citation | All baseline null; no guessed source |
| O.Detailed workbook; Nts.Detailed workbook | artifact reference in office/country raw envelope | Exact Europe_Excluding_Russia.xlsx resolves manifest.source_inputs workbook hash/entry, not an HTTP source. Recovery container may be archive; not unresolved citation or source row |
| Nts.Screen evidence; coverage.json.screen_source | country locator; calendar_context | Exact inline URL resolver; no day-date assertion |
| Cal.Source URL | Cal input locator; calendar_context | Retain cohort C082 and all null date cells; Tier has no classifier role |
| Ctl.Control source; Ctl.Poll source | Ctl input locator; control_observation / national_poll | One claim per row/field; retain Office ID, source date, limitations; no present-tenure inference |
| Poll.Source URL | Poll input locator; national_poll | Retain entire single record, including fieldwork, sample, blocked primary-retrieval caveat and no-local-conclusion limits |
| BF and P/albania.html external href | Corresponding artifact input locator; artifact_reference | Parse inertly, never execute scripts; index original anchors; catalogue/inline resolution only. Relative ../albania.html is navigation, not a source |
| S.Source URL and source-links URL lists | Source/input raw provenance | Catalogue/list metadata are not evidence that every source supports every office; no automatic all-to-all evidence links |
| T.classifications[].evidence | Exact retained register path/hash/sheet/row | Classification FK + raw provenance. Do not fabricate a remote source for the tier file |

All other JSON fields remain losslessly retained. Only designated citation columns or explicit citation markup are tokens; “Nominating party not yet matched” is a party-label limitation, not a citation. A nonblank non-URL source token with no exact catalogue match is unresolved_evidence. A known, resolved ID missing from staging is instead a fatal FK/integrity error. Baseline designated citation columns supply URLs that resolve; zero unresolved rows is expected for this mapped baseline, not a global assumption for future packages.

HTML heading extraction is narrowly allowed to preserve **supplied event kind**: match Office ID filename and exact selected ballot date. There are 381 historical h3 headings but only 366 selected matches. The 15 unselected older headings remain retained artifacts and are not extra election rows. Heading labels yield 350 ordinary, 15 special and one repeated selected event. These labels improve on the bridge's coverage-text heuristic without changing its IDs. Do not extract rounded HTML vote shares over full-precision JSON values.

## Conservative projection and conflicts

The baseline has no independent structured proceeding or party-concordance collection. Winner-certification text, coalition labels and exclusion notes are preserved in H/D/BF raw evidence; they are not invented proceeding IDs or party equivalence rows. The core schema cannot separately represent winner certification and a preliminary numerical vector as two statuses without supplied proceedings. Store preliminary where explicitly stated; otherwise unknown for legal_outcome, retaining the full certification wording. Likewise “Reported candidate votes”, “Published final candidate/list vote total” and the Shkodër candidate-table/accounting discrepancy lack an unambiguous schema-v1 denominator enum: retain them verbatim and project ballot_basis=unknown. This is conservative vocabulary projection, not deletion of evidence. electoral_system remains NULL because no dedicated system field is supplied.

A documented override is a separate checked-in JSON input under `data/overrides/atlas/albania/`; it never modifies P. Require original target key, source locator/hash, original value, proposed value, reason, supporting source IDs/URLs and a decision (`accepted`, `withhold`, `withdraw`, `supersede`, or identity binding). Reject unspecified/ambiguous targets. Input files are UTF-8 JSON, retained whole and hashed; for deterministic behavior apply no two accepted patches to the same target/field unless the later explicitly names the earlier override and replaces it. Cycles or unordered overlaps fail. Store actual decision and both claims in evidence_link.claim_json, with the override input locator. Non-citation operational identity overrides still retain raw provenance/crosswalk but do not manufacture evidence sources.

Package values win when there is no applicable documented override. An accepted override records both original and corrected claim and changes the fingerprint. If the override decision is withhold, dated claims each get distinct research_date/evidence_link rows; office.next_date_id/next_history_key or event.date_id is NULL and resolution=conflicting. Do not turn the two claims into a range. Numeric conflicts use NULL/unknown in the single value/status slots and retain the dispute in evidence_status/claim_json; no computed metric is emitted. A future override payload must identify target table, full PK, field name, expected original value and replacement; mismatch fails rather than patching a nearby row.

## Ancillary retention and score gates

Ctl retains exactly 45 original dated observations; Poll exactly one national poll. Preserve every column, original null and note in retained_input.payload_json; no new metric, poll or officeholder tables. Preserve original observatory poll/person-observation IDs as aliases to their retained **input** locator (entity_kind=input), with original type and row pointer in crosswalk.raw_json; do not mislabel them office/event IDs. Exact formulas for those aliases are in Identity Rules.

Keep all O score columns (Latest eligible gap pp, Middle gap pp, Oldest gap pp, Weighted gap pp, Competition score, Historical competition screen, Pedersen interval 1 pp, Pedersen interval 2 pp, Mean Pedersen pp, Margin dispersion pp, Volatility interpretation, Polling and government watch, Historical coverage), all Parameters and Read me rows, coverage gaps and cached-formulas.json.sheets unchanged. Preserve actual withheld wording in BF, including the 2019 boycott/party-coalition comparability limit. No explicit score_gate boolean is present in these extracted table columns; do not invent one. If a later retained normalized input supplies score_gate:false, preserve false literally. No formula recalculation or clearing of withheld output.

Briefings are retained_input artifacts by original byte hash, with typed input locator and office filename binding in identity_crosswalk/raw provenance. Copy/store as inert bytes; do not render/execute them during ingestion. Never treat display-rounded percentages in briefings as replacement detailed-return values. Original workbook/archive provenance remains in manifest: the shared archive SHA-256 is 93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9, workbook SHA-256 b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665. Optional recovery from that archive verifies exact entry bytes; it does not add other countries to Albania's lineage.

## Refresh and publication

Staging is a consistent backup on the same filesystem. Start/commit the independent ledger first; preserve all unrelated lineages. For a changed Albania release, copy retained omitted records because coverage_complete=false, repoint all active Albania projection/provenance FKs to the new selected release together, and preserve original source hash/location and prior release in raw envelopes. Include inherited inputs in the effective fingerprint. Keep full old release snapshots, not only metadata. No INSERT OR REPLACE. Explicit sourced withdrawal keeps the ID addressable and changes record_state/state_note; it is not a deletion.

Validate all Prompt C CI gates, checkpoint WAL without busy frames, close staging connections, safely handle readers/sidecars, fsync file, atomic rename, fsync parent, then finalize ledger success. Failures before swap leave the last good publication serving and log failed outside staging. After an ambiguous post-rename crash, reconcile receipt/release set before assigning a terminal state. Unchanged re-import reuses release_id but has a new attempt/receipt. Do not claim byte-identical SQLite files as the invariant.

Reserved future lineage identifiers: `latin-america-fe5e91689def` (existing lineage/citation alias reserved for continuity) and `country-package-new-zealand` (existing country-package family). No LatAm/NZ rows loaded here. No Europe-only constraints or dummy offices for status-only countries. Albania remains storage proof with regional=0; no populated regional-calendar proof is available. Andorra is the later honest empty-state demo. Geometry/reform, tightness/competition and regional calendar materialization are deferred.

## Document verification

Both unchanged DDL files were introspected to check that every table column is represented in this map. The frozen Albania validator passed 122 offices, 366 selected histories, 3,843 returns, 45 control observations, 182 catalogue rows and 122 briefings; its crosscheck and listed content hashes passed. Additional read-only inspection verified one poll, 185 distinct catalogue/inline URLs, 122 bridge geography IDs, exact selected HTML-heading matches, and missing/zero seat counts. These are source/document checks, not an implemented import or publication CI run. The canonical tier file remains missing.
