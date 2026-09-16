# Alderney → Atlas master field map

**Prompt K documentation draft for Cursor implementation.** Main fetched and pinned at **73b69bdd607c2ed5f70a93b52b5cd0c66f4155c9** (`Merge pull request #20`), repository `FTFNAnalytics/digitaldemocracy`, inspected 2026-09-16. All input reads use that immutable commit. Folder: `docs/phase1/alderney/`. Albania remains the completed Phase 1 proof; Andorra is Europe #2; Alderney is Europe #3; Armenia remains last among early targets. The folder mirrors Prompt C/J and does not change phase scope.

The accepted plan, Prompt B master/ledger migrations, Albania Prompt C documents and `lib/atlas/identity.ts` govern this map. Their relevant bytes match the previously reviewed Prompt J baseline. Prompt J Andorra field-map documents are **not checked into this main tip**; the delivered Andorra review pack is used as the formatting pattern. Andorra files are untouched. Some old plan/document status prose is stale; live approved tier bytes govern. No locked product decision is reopened.

**Approved T is consumed unchanged**, SHA-256 `e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7`; register SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9`. Two records are approved **other**, zero regional. No tier approval or rewrite. This map covers **223 destination columns in 20 tables**, operational schema notes and every source column actually supplied. [Identity rules](Alderney_Identity_Rules.md), [worked examples](Alderney_Acceptance_Examples.md), [checklist](Prompt_K_Field_Map_and_CI.md), [input inventory](Alderney_Input_Inventory.json) and [ID vectors](Alderney_Identity_Vectors.json) form the implementation contract. No importer/SQLite row load or publication is performed.

## Baseline

| Recomputed baseline count | Value |
| --- | ---: |
| current_offices | 2 |
| historical_offices | 0 |
| geographies | 2 |
| selected_histories | 6 |
| prospective_events | 2 |
| total_events | 8 |
| research_dates | 8 |
| result_rows | 27 |
| control_observations_supplied | 0 |
| poll_records_supplied | 0 |
| source_catalogue_rows | 6 |
| inline_only_sources | 1 |
| sources | 7 |
| briefings_retained | 2 |
| other_offices | 2 |
| regional_offices | 0 |
| municipal_offices | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| package_files_retained | 20 |
| retained_inputs | 21 |

Six H histories plus **two already-existing bridge prospective identities = eight events**. All eight dates have day precision; the six historical certainties remain unknown and two 2026 certainties conditional. All 27 votes/shares are positive; seats have 14 ones and 13 zeros. Zero result rows for prospective events. No structured proceedings or sourced party concordance supplied.

`tables/governing-control.json` and `tables/polling-evidence.json` are **absent**, not empty collected tables. Count zero means no supplied records, not absence of officeholders or polls. Score fields are null/unavailable; no scores are recomputed. `coverage_complete=false`, `site_ingestion_status=pending_adapter` and remaining gaps stay raw; mapping completion is not complete research.

## Source notation and raw retention

P=`data/countries/alderney/`. Append relative filenames below. For table F row i and exact column c at index j: `/rows/i/j` identifies the cell; original workbook row is F.source_rows[i], sheet F.sheet. Zero-based JSON indices, original workbook row numbers never reconstructed from i+2. Reject malformed row shapes/duplicate columns/invalid required identity types.

| Alias | Exact file / collection |
| --- | --- |
| M | P + manifest.json |
| O | P + tables/office-register.json; Office register |
| H | P + tables/history-index.json; History index |
| D | P + tables/detailed-returns.json; Detailed returns |
| S | P + tables/sources.json; Sources |
| Nts | P + tables/country-notes.json; Country notes |
| Cal | P + tables/election-calendar.json; Election calendar |
| BF | P + briefings/{exact Office ID}.html |
| T | schemas/atlas/tiers/alderney.json; classifications[] (approved) |

All **20 package files + T =21 inputs**, including 16 manifest-listed files and four additional tracked files (manifest.json, README.md, extract.py, validate.py). Other retained files include coverage.json, source-links.json, cached-formulas.json, history-index-crosscheck.json, country-coverage/parameters/read-me tables and alderney.html. Crosscheck is reconciliation only, not six extra events. Retain script bytes; the future importer must not execute them. The standalone package validator was run read-only during documentation review.

Locator: `{input_path,sha256,json_pointer,sheet,source_row,column,html_anchor_index}`, unused fields null, JSON root pointer empty string. HTML anchor index is zero-based document-order `<a>`. Heading supplemental provenance carries exact BF hash, heading section / details summary, h3_index and text. Stable occurrence tuple `[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]` excludes mutable hash/R; inherited collisions add retained_input_path while original path remains unchanged.

Raw envelope: `{origin:locator,row:original_object,columns:original_columns_or_null,values:original_row_or_null,supplemental:original_supporting_items_with_their_own_locators}`. Table row is exact zip(columns,values). Preserve source nulls/strings/numbers and unknown upstream fields in envelope and full retained_input.payload_json. There is no new extensions column: use existing raw_json/payload_json and recoverable immutable bytes. Source claims and operational bindings are distinct.

Common policies: JSON null→SQL NULL unless an explicit status records unknown; optional blank scalar→NULL with original retained raw. Identity blanks, nonfinite numbers, numeric-string guessing, invalid dates and partial FKs fail. No trimming/Unicode normalization of IDs. Every live typed row uses its owning L/R, where N=cdd-observatory-v1 and L=country-package-alderney. Empty proceeding/party_mapping tables mean NO ROW for every column, never dummy rows. All required FKs fail closed.

## dataset_lineage

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + bridge packageRelease | Fixed `country-package-alderney`; never a per-run ID. | L; PK | One source-dataset lineage, not one continent. |
| provenance_kind | M.schema_version | `country_package`; require `europe-country-extract/1`. | L | Reject fixture/unknown provenance. |
| description | M.country | `Alderney frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | All P files + T + applicable override files + version contract | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-alderney-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_checked_through | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Not today or attempt timestamp. |
| upstream_release_id | europe.ts packageRelease(inventory).id | Copy existing `country-package-alderney`. | R | Legacy alias retained; not new Atlas release ID. |
| validated_counts_json | Recomputed O/H/D/S/Cal/BF plus prospective bridge events | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | Counts in Baseline; eight total events include six selected histories and two prospective; absent observations ≠ real-world zero. |
| research_coverage_complete | M.coverage_complete | false → 0; require false for this frozen baseline. | R | Do not turn successful validation into complete coverage. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve pending_adapter; not publication status. |

## retained_input

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | Every tracked file below P; accepted T; applicable overrides | Repo-relative POSIX path, no leading slash, traversal or symlink. Inherited path rule in Identity Rules. | (L,R,input_path) | 20 actual package files + one approved tier =21; no fabricated files for absent optional tables. |
| input_kind | Path class | T=tier_classification; overrides=override; *.html=artifact; every other P file=package. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | Verify all 16 manifest-listed files, exact register and approved tier hashes; hash original bytes. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | `sha256:<sha256>` content-addressed locator; fetch/store bytes before publication; git commit/path also retained in inventory. | (L,R,input_path) | Resolve and rehash every locator; scratch/working-tree existence alone is insufficient. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | Full JSON equality; controls/poll table paths absent, so no invented empty retained_input rows. |

## country

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | M.country; bridge slug | Literal `alderney`, existing ID. | country_id | No new country from shared Read me text. |
| country_code | M.country_code | Copy `GG-ALD`. | country_id | Internal territory identifier, not a separate sovereign ISO claim; preserve exact code. |
| name | M.country | Copy `Alderney`. | country_id | Nonempty. |
| polity_kind | M.country / country_code; accepted plan | `territory`, from M.country/code, README and approved classification. | country_id | Do not force sovereign_country or invent a parent-country row. |
| region_id | M.region | Europe → `europe`; geographic region, not office tier. | country_id | Not calendar cohort. |
| coverage_status | M.coverage_complete; coverage.json.status | `partial`. | country_id | Coverage notes remain available. |
| screening_as_of_label | No separate Alderney screening-as-of field | NULL; research_checked_through belongs to release. | country_id | Do not infer from Accessed or packaged_on. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Final 2026 approval and direct primary numerical comparison remain pending; unopposed ordinary context retained. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `alderney`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction + O.Office + bridge key | G=key("geo",["alderney",Jurisdiction,Office]); frozen bindings retained thereafter. | (country_id,G) | Two distinct bridge IDs despite identical jurisdiction names; office type participates; no merge by name. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent geography/code supplied; NULL, not an invented Guernsey/UK FK. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row for this G | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | Exactly GG-ALD-PLEB and GG-ALD-STATES; no IDs multiplied from seat counts. |
| country_id | O.Country + M.country | `alderney`; exact Alderney label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N,office_id) | FK (alderney,G); two existing office-type-specific bridge bindings. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O.Office | Verbatim: Plebiscite nominating two Guernsey States representatives; States members (five of ten ordinary seats). | (N,office_id) | Office type is separate from approved other tier; no invented seat-level offices. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date / O.Calendar evidence + office-specific Cal date and Cal.Date status | Point to corresponding prospective event ballot date_id: event owner key(next,office_id), slot ballot. | (N,office_id) | Same date row as prospective event; both day precision/conditional. Never a November–December range. |
| next_date_resolution | Same date inputs | `resolved` for both: unique supplied labelled conditional date, not legally verified. | (N,office_id) | Certainty lives separately in research_date; conditional never promoted to called/statutory. |
| next_history_key | Existing bridge upcoming event for O.Next polling date | `key("next",office_id)`; equals that public next event_id. | (N,office_id) | FK (N,office_id,HK) exists; two prospective events, no synthetic results. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | T.tier=other → other for both. National→national_context; unknown→NULL if ever explicitly supplied. | (N,office_id) | 2 other, 0 municipal, 0 regional; geographic tier never inferred from cohort labels. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | Known tier: approved only if accepted T.status="approved" and neither row flag true; otherwise needs_review. Unknown tier→unknown. | (N,office_id) | Both approved: root status approved; absent human_review_required/tier_uncertain are not true. Preserve T bytes. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/alderney.json`. | (N,office_id) | Already present and approved at pinned commit; retain original bytes. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Accepted T bytes | Exact live approved byte SHA-256 `e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7`. | (N,office_id) | Exact retained-input path/kind/hash FK; no reserialization of approved file. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| date_id | H event or O prospective event + ballot slot | `date-`+SHA(C([N,"event",event_id,"ballot"])); office next pointer reuses prospective event date_id. | date_id | Eight distinct owners: six historical, two prospective; stable on corrected values. |
| label | H.Ballot date if recorded; O.Next polling date (Cal confirms binding) | Exact supplied ISO date strings. Later blank H date can use supplied Year only; no invented day. | date_id | All eight baseline dates have a recorded day. |
| precision | Full-string grammar in Conditional dates and event attachment | `day` for all eight; full-string Gregorian parser. Later month/year/range/unknown retained as such. | date_id | Day precision describes detail, not certainty. |
| certainty | H historical context; O calendar citation + Cal.Date status + README/BF caveats | Six histories→unknown; two prospective→conditional from Official July proposal; final resolution not yet verified. | date_id | No broad calendar certainty applied to historical dates; no called/statutory inference. |
| year | H/O parsed date label | Integer 1..9999; NULL if unknown or range. | date_id | H year agrees with H.Year; prospective year2026. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicit ranges use parent owner slot+/start. | date_id | Two different contests are not range endpoints. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicit ranges use parent owner slot+/end. | date_id | Never treat December plebiscite as a November runoff. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H original date/year or O original row plus Cal certainty/date locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## election_event

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | H or O prospective office identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H.Office ID or O.Office ID for prospective | Copy exact. | (N,office_id,history_key) | FK office; every H row resolves. |
| history_key | H.Office ID/Year/Ballot date; O.Office ID for prospective | H: exact HK formula; prospective: key("next",O.Office ID). Preserve existing bindings. | (N,office_id,HK) | 8 unique namespaced event keys; six selected, two none; crosscheck adds zero. |
| event_id | Existing bridge history or next event identity | History key("event",["alderney",HK]); prospective key("next",office_id). | (N,event_id) | Preserve all eight bridge public IDs; no attempt/release component. |
| date_id | H or O mapped research_date | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | Eight actual research_date rows. Both office and prospective event use same corresponding date_id; NULL only conflicting claims. |
| date_resolution | Parsed historical or prospective date + documented conflicts | `resolved` for all eight baseline dates, with certainty stored independently. | (N,office_id,HK) | Prospective conditional means unverified approval, not a missing date or conflicting pair. |
| event_kind | BF h3 inside Recorded historical entries for exact H date; no dedicated prospective kind field | Ordinary partial renewal→ordinary (4 histories); Replacement election→special (2 histories). Prospective→unknown. | (N,office_id,HK) | Do not map replacement to repeated; prospective plebiscite has no schema enum, no invented special-election assertion. |
| selected_history_role | H selected membership versus O prospective | Six H rows→selected; two next events→none. | (N,office_id,HK) | Additional ordinary-cycle HTML context stays artifact; do not add duplicate 2024 or invented selected 2022/2020 States rows. |
| electoral_system | No dedicated voting-system field in H | NULL; Vote basis is not an electoral system. | (N,office_id,HK) | No guessed FPTP/PR/See source briefing. |
| comparability | H.Coverage + H.Comparability status; prospective O.Historical coverage | Histories: join exact nonempty strings with · surrounded by spaces. Prospective: verbatim O.Historical coverage. | (N,office_id,HK) | All six historical Unscored / inapplicable states retained. |
| ballot_basis | H.Vote basis; prospective has no dedicated ballot-basis field | Exact Candidate marks; overlapping voter choices, normalized to all recorded candidate marks→candidate_marks. Prospective→unknown. | (N,office_id,HK) | Candidate marks are not unique voters or party votes; D basis agrees with matching H. |
| share_unit | H.Leader share and D.Share on stated basis; BF Share heading | `percent_0_100` from historical D/BF share convention; preserve bridge prospective unit but zero result rows there. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | H.Coverage; O prospective date relative to research snapshot | Histories→unknown (secondary numerical comparison pending). Prospective→not_held as of 2026-09-11. | (N,office_id,HK) | Not_held describes prospective snapshot, not cancellation. No certification inferred from title/official link. |
| record_state | Selected H or supplied O prospective membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row + selected BF heading or O row + Cal date/status evidence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## proceeding

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Alderney package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | D.Office ID | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D.Office ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D.Office ID / Year / Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | All 27 D rows resolve to exactly one of six H keys; none attach to prospective events. |
| result_row_id | Bridge per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | Never reassign index after sorting by votes or after refresh omission. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Country + matched office | `alderney`. | (N,result_row_id) | Composite FK enforces office country. |
| candidate_or_list_label | D.Candidate or list | Exact string; NULL if absent, no invented Unlabelled source row. | (N,result_row_id) | All baseline supplied. |
| original_party_label | D.Party or proposer | Exact original D.Party or proposer text; no cross-year coalition equivalence. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | Bridge result.partyCode = D.Party or proposer | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Not a new authoritative standardized party code. |
| party_namespace | D.Year + country package source scope | `alderney/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Existing bridge namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 27 supplied positive safe integer candidate-mark counts; not unique electors. |
| votes_status | D.Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | All baseline positive; independent of evidence_status. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 27 supplied counts:14 ones,13 zeros,0 null. No inference of extra offices or boolean elected flag. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D.Result coverage | Case-insensitive preliminary/provisional→preliminary; otherwise recorded if votes/share supplied, else unknown. | (N,result_row_id) | Reported numbers stay numbers even when preliminary; no certification inference. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | S rows / exact inline URL occurrence | `alderney`. | (alderney,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-alderney`. | (alderney,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | S.Source ID; genuine inline URL | Catalogue `alderney--` + Source ID; inline-only `alderney--` + key("url",exact URL). | Source tuple | 6 catalogue +1 genuine inline-only URL=7 canonical sources; preserve every bridge URL alias. |
| publisher | No dedicated publisher column in S; inline context lacks explicit publisher metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S.Title | Catalogue Title verbatim; inline-only title NULL (anchor label is not asserted document title). | Source tuple | Keep source title even where its date differs from a supported event; title never overwrites event date. |
| url | S.Source URL; genuine inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | Exact unique catalogue URL match; no fetching or claiming current availability. |
| checked_as_of_label | S.Accessed | Catalogue Accessed copied; one inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | S original row or inline URL occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | alderney except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party mapping target; Independent labels remain separate contextual result strings. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-alderney for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator object) using exact definition below; table rows carry source_rows[i], JSON pointer, SHA and logical path. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | alderney. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-alderney. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H→event and date; D→result; O calendar citation→calendar_context and prospective event/date; Cal/Nts/coverage→calendar_context; HTML→artifact_reference; explicit override→override. | evidence_id | Exact target/claim combinations in Evidence traversal; no baseline control/poll claims. |
| date_claim_id | H ballot date or O prospective ballot date; future independent claim | Actual date_id only when claim_kind=date; otherwise NULL. | evidence_id | Prospective date claim carries O date plus Cal conditional-status provenance; event/office target points to same date. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | `preserved_bridge_id`, `package_source_id`, `exact_url_catalogue_alias`, `baseline_row_binding`, or `documented_identity_correction`. | Crosswalk PK | Correction requires retained override; no undocumented reassignment. |
| lineage_id | Owning package M / staged lineage | `L = country-package-alderney`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Alderney row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination column | Exact source / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Alderney. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## schema_migration

Both databases retain their existing migration-controlled version=1, literal description and PRAGMA user_version=1. No research field maps to these operational columns; DDL digests are separate schema_inputs. No migration is edited or re-executed here.

## Conditional dates and event attachment

| Office / O pointer | Date | Calendar confirmation | Research date / event linkage |
| --- | --- | --- | --- |
| GG-ALD-STATES; /rows/1/4, source_row125 | 2026-11-21 | Cal /rows/0/4, source_row70 | Own prospective key(next,office_id); office and event share that ballot date_id |
| GG-ALD-PLEB; /rows/0/4, source_row124 | 2026-12-12 | Cal /rows/0/5, source_row70 | Different prospective key(next,office_id); own ballot date_id |

Each date uses precision=day, certainty=conditional. Cal /rows/0/6 says exactly “Official July proposal; final resolution not yet verified”; O.Calendar evidence and Cal.Source URL point to the same real official proposal URL. Package README and BF caveats explicitly tie the first date to States renewal and the second to the plebiscite. Store this source-specific binding in raw/evidence; do not infer from generic First/End headings alone. **December is not a runoff or end date of November.** range_start_id/range_end_id remain NULL.

resolution=resolved means one supplied date is selected at its stated certainty; it does not mean legally final. Do not convert conditional→called/statutory, or confuse an unverified date with two conflicting claims. Histories retain unknown certainty, independent of the calendar proposal. Full dates/years must agree. Full-string YYYY / YYYY-MM / YYYY-MM-DD / D Month YYYY / Month YYYY parser preserves precision and raw label; invalid dates fail. Only absent historical date may fall back to supplied Year. Unknown narrative is not silently reduced to a year/day. Future known range endpoints must be non-range, ordered, acyclic; filter by interval overlap without storing fabricated day1. Unknown is not confirmed in-window. Separate conflicting claims remain sourced, single resolved pointer withheld with conflicting state.

Prospective kind=unknown is conservative: the schema has no plebiscite enum, and O does not supply a dedicated upcoming event-kind field. Preserve office_type and context verbatim. This intentionally does not copy the bridge's office-name regex that labels a plebiscite special; public next IDs are still identical. Historical kinds use actual BF heading labels: four ordinary partial renewals and two replacement elections→special, not repeated. No formal post-plebiscite States election/proceeding ID is invented from narrative.

## Selected histories and additional ordinary context

For historical kind matching, restrict BF heading extraction to the **Recorded historical entries** h2 section, excluding the nested details block with summary **Additional ordinary-cycle context**, matching the exact H ballot label and office filename. PLEB h3 indices0/1/2 correspond to 2024/2022/2020. STATES h3 indices0/1/2 correspond to 2025/2024/2023. STATES nested **Additional ordinary-cycle context** details h3 indices3/4/5 preserve 2024/2022/2020 separately. The 2024 heading is repeated as context, not a second event; 2022 unopposed renewal and 2020 ordinary results are not selected H/D rows and remain recoverable artifact evidence. Do not add or delete selected events to make three ordinary cycles.

This mapping preserves every supplied public bridge event ID (six H plus two next). It does not invent new public event IDs from HTML. In particular, preserve the 2022 unopposed narrative and em-dash missing votes/shares as artifact bytes; do not coerce them to zero or duplicate the 2023 vacancy event. Formal election of representatives remains a stated separate step, not a fabricated proceeding.

## Evidence traversal

Create real typed record_locator rows for country/geographies/offices/events/results/sources/each retained input. No date/tier/metric locator kind exists. Dates link through office/event targets; T provenance has a mandatory retained_input path/kind/hash FK. Unknown upstream fields remain raw.

| Source occurrence | Target / claim_kind | Required interpretation |
| --- | --- | --- |
| H.Source URL | event locator; event and date | H date_id only on date claim; exact H provenance |
| D.Source URL | result locator; result | Exact row-level citation and full candidate-mark basis |
| O.Calendar evidence | office locator calendar_context; associated prospective event locator event and date | Date claim references shared prospective date_id; claim_json includes O date and Cal conditional-status/date locators |
| Cal.Source URL | Cal input locator; calendar_context | Retain C123 whole row; no blanket range or tier inference |
| Nts.Screen evidence and coverage.screen_source | country locator; calendar_context | Same proposal reference, no final approval assertion |
| O/Nts.Detailed workbook | raw artifact reference | Manifest workbook path/hash; not fabricated HTTP source |
| BF / alderney.html external href | owning artifact input locator; artifact_reference | Parse inertly with original anchor index; no scripts executed |
| S metadata/source-links lists | source/input raw provenance | Not all-to-all source support for every event |
| T.classifications[i] | classification retained-input FK / original row | Preserve approved file/root source_register; no invented source URL |

Six catalogue IDs and exact URLs are unique. Catalogue source IDs get alderney-- prefix. One real inline-only URL is `https://alderney.gov.gg/CHttpHandler.ashx?id=202055&p=0`; preserve exact encoding, deterministic URL-form ID and missing title/publisher/access date=NULL. No downloaded remote-file hash is supplied. Catalogue grade remains grade, not publisher. S row0 Title says Alderney 2024-12-07 election result even when the URL supports a 2024-11-16 States row: preserve title and actual event dates independently. Do not repair titles or select dates from URL/title years.

Resolve exact catalogue token then exact URL. Preserve bare/prefixed source IDs and bridge URL aliases in crosswalk; do not duplicate a canonical catalogue row. Unknown/invalid/ambiguous citation tokens have explicit unresolved_evidence tied to real targets; never fabricated URLs. A known resolved source omitted by staging is a fatal FK error, not unresolved. All current designated table/HTML external references resolve to seven canonical sources; baseline expected unresolved count=0. Relative navigation, filenames and arbitrary prose are not citation tokens.

## Source-column coverage and absent tables

Every column below survives in its whole-file payload; mapped entities also retain the complete source row. “Raw only” is intentional lossless retention, not an invented column or dropped data. Source pointer is /rows/i/j, column identity /columns/j. The package has nine table files; no polling/control table exists, so do not fabricate retained rows or observations for those paths.

### country-coverage

`data/countries/alderney/tables/country-coverage.json`; sheet `Country coverage`; 1 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Country or territory | raw only; whole retained_input.payload_json and byte locator |
| 1 | Office records | raw only; whole retained_input.payload_json and byte locator |
| 2 | Historical entries | raw only; whole retained_input.payload_json and byte locator |
| 3 | Three entries | raw only; whole retained_input.payload_json and byte locator |
| 4 | Competition scores | raw only; whole retained_input.payload_json and byte locator |
| 5 | Grouped volatility scores | raw only; whole retained_input.payload_json and byte locator |
| 6 | Sourced current control | raw only; whole retained_input.payload_json and byte locator |
| 7 | Calendar cohorts | raw only; whole retained_input.payload_json and byte locator |

### country-notes

`data/countries/alderney/tables/country-notes.json`; sheet `Country notes`; 1 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Country or territory | country label check + raw |
| 1 | Scope and remaining gaps | country.notes |
| 2 | Election calendar | raw only; whole retained_input.payload_json and byte locator |
| 3 | Detailed workbook | raw manifest artifact reference |
| 4 | Screen evidence | country calendar_context evidence |

### detailed-returns

`data/countries/alderney/tables/detailed-returns.json`; sheet `Detailed returns`; 27 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | result_row.office_id/HK |
| 1 | Country | result_row.country_id |
| 2 | Jurisdiction | raw + office check |
| 3 | Year | HK; party_namespace |
| 4 | Ballot date if recorded | exact HK join |
| 5 | Electoral unit | semantic result binding + raw; null baseline |
| 6 | Candidate or list | candidate_or_list_label |
| 7 | Party or proposer | original_party_label/code, exact Independent; no group inference |
| 8 | Votes or marks | votes/votes_status; marks ≠ voters |
| 9 | Share on stated basis | share/share_status, percent_0_100 |
| 10 | Seats | seats/seats_status |
| 11 | Result coverage | evidence_status=recorded plus raw; no certification |
| 12 | Vote basis | raw + H basis agreement |
| 13 | Source URL | result evidence |

### election-calendar

`data/countries/alderney/tables/election-calendar.json`; sheet `Election calendar`; 1 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Cohort ID | raw only; whole retained_input.payload_json and byte locator |
| 1 | Country | raw only; whole retained_input.payload_json and byte locator |
| 2 | Election cohort | raw only; whole retained_input.payload_json and byte locator |
| 3 | Tier | raw only; NOT a tier classifier |
| 4 | First or scheduled date | confirmation of STATES date; not range start |
| 5 | End or runoff date | confirmation of PLEB date; not range end/runoff |
| 6 | Date status | conditional for both named O next dates; exact raw text |
| 7 | Historical cycles | raw only; whole retained_input.payload_json and byte locator |
| 8 | Coverage and timing | raw only; whole retained_input.payload_json and byte locator |
| 9 | Prior-call units if known | raw only; whole retained_input.payload_json and byte locator |
| 10 | Source URL | Cal input evidence; prospective certainty provenance |

### history-index

`data/countries/alderney/tables/history-index.json`; sheet `History index`; 6 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | election_event.office_id/HK |
| 1 | Country | raw + country check |
| 2 | Jurisdiction | raw + office/geography check |
| 3 | Ballot date if recorded | research_date.label/components; HK |
| 4 | Year | HK; check date year |
| 5 | Leading candidate or party | raw only; whole retained_input.payload_json and byte locator |
| 6 | Leader share | raw only; whole retained_input.payload_json and byte locator |
| 7 | Runner-up candidate or party | raw only; whole retained_input.payload_json and byte locator |
| 8 | Runner-up share | raw only; whole retained_input.payload_json and byte locator |
| 9 | Vote basis | candidate_marks; preserve full denominator text |
| 10 | Coverage | comparability + raw; legal outcome unknown |
| 11 | Comparability status | comparability + raw |
| 12 | Source URL | event/date evidence |

### office-register

`data/countries/alderney/tables/office-register.json`; sheet `Office register`; 2 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Office ID | office.office_id; T join; crosswalk |
| 1 | Country | office.country_id label check |
| 2 | Jurisdiction | geography.name / bridge binding; office.name |
| 3 | Office | office.office_type/name; bridge geography scope |
| 4 | Next polling date | prospective research_date + office/event FK; conditional certainty from matched Cal |
| 5 | History entries | raw + six H membership count check (3 each) |
| 6 | Latest eligible gap pp | raw only; whole retained_input.payload_json and byte locator |
| 7 | Middle gap pp | raw only; whole retained_input.payload_json and byte locator |
| 8 | Oldest gap pp | raw only; whole retained_input.payload_json and byte locator |
| 9 | Weighted gap pp | raw only; whole retained_input.payload_json and byte locator |
| 10 | Competition score | raw only; whole retained_input.payload_json and byte locator |
| 11 | Historical competition screen | raw only; whole retained_input.payload_json and byte locator |
| 12 | Pedersen interval 1 pp | raw only; whole retained_input.payload_json and byte locator |
| 13 | Pedersen interval 2 pp | raw only; whole retained_input.payload_json and byte locator |
| 14 | Mean Pedersen pp | raw only; whole retained_input.payload_json and byte locator |
| 15 | Margin dispersion pp | raw only; whole retained_input.payload_json and byte locator |
| 16 | Volatility interpretation | raw only; whole retained_input.payload_json and byte locator |
| 17 | Polling and government watch | raw only; whole retained_input.payload_json and byte locator |
| 18 | Historical coverage | raw only; whole retained_input.payload_json and byte locator |
| 19 | Detailed workbook | raw manifest artifact reference |
| 20 | Calendar evidence | office/prospective evidence links |

### parameters

`data/countries/alderney/tables/parameters.json`; sheet `Parameters`; 12 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Assumption | raw only; whole retained_input.payload_json and byte locator |
| 1 | Value | raw only; whole retained_input.payload_json and byte locator |
| 2 | Definition | raw only; whole retained_input.payload_json and byte locator |

### read-me

`data/countries/alderney/tables/read-me.json`; sheet `Read me`; 13 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Topic | raw only; whole retained_input.payload_json and byte locator |
| 1 | Use and interpretation | raw only; whole retained_input.payload_json and byte locator |

### sources

`data/countries/alderney/tables/sources.json`; sheet `Sources`; 6 rows.

| j | Exact source column | Destination / rule |
| ---: | --- | --- |
| 0 | Source ID | source_id + aliases |
| 1 | Title | source.title verbatim |
| 2 | Source URL | source.url + resolver |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

## Retained artifacts, metrics and coverage

All score inputs/formula caches/method Parameters/Read me/limitations stay lossless. No competition, tightness or volatility computation. Both O Competition score cells and all grouped Pedersen values are null; unavailable does not mean numeric0. Shared Europe-wide contextual totals in Parameters/Read me are not Alderney totals. No explicit score_gate boolean is supplied in extracted column schema; future false remains false. Independent labels do not form one common party/group for volatility. No poll/control observations were collected here; retain prose limitations without invented observation IDs.

Retain both office briefings and alderney.html as inert artifact bytes, payload_json=NULL, hash/path-backed input locators. No embedded code execution. Preserve all additional history context; display-rounded HTML values never replace full-precision D numbers. Source numerical comparisons remain pending even when software mapping passes.

Shared off-git recovery metadata: archive SHA `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9`; workbook SHA `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665`. These are verified manifest values, **not a fresh download/reverification of the off-git archive in Prompt K**. Whole package bytes are recoverable from pinned git; raw inputs also require durable content-addressed locators at future publication. Recovering the shared workbook does not load other countries into this lineage.

## Overrides and incomplete refresh

No Alderney override exists in this baseline inventory. Future separately accepted `data/overrides/atlas/alderney/` atlas-override/1 inputs must identify L, full target keys, expected_original, replacement, decision and source-specific evidence; see Identity Rules. Package wins unless an applicable documented decision selects another claim. Neither automatic date confirmation nor Mexico override reuse is allowed. Keep both conflicting claims/sources and withhold single date/value; explicit sourced withdrawal/supersession preserves IDs and status notes.

Incomplete package is not deletion. Carry omitted office/event/result/source/tier/evidence/alias rows only from a real prior publication, retaining old bytes and bindings in the effective fingerprint. A first import missing a required baseline row fails. Old/new bytes sharing a path use `inherited/sha256/<old_hash>/<original_path>` for retained storage; original locator stays raw, typed input FK uses actual retained path. Effective tier union equals effective office IDs. Active Alderney projection points consistently to new selected R, with original provenance and full prior snapshot auditable. No INSERT OR REPLACE or index recycling.

## Publication and empty regional state

Commit started attempt in separate durable ledger before staging. Make consistent same-filesystem backup, preserve complete unrelated lineage release set and rows, validate candidate (foreign_keys=ON, recursive_triggers=ON, foreign_key_check empty, integrity_check ok, all identity/value/hash/coverage gates). Checkpoint staging WAL with no busy frames, close connections/handle sidecars/readers, fsync file, atomic rename, fsync parent, then finalize ledger success. Pre-swap failure leaves last good master serving and durable failed attempt; reconcile master receipt after ambiguous post-rename crash before terminal status. Keep prior full snapshots, not metadata alone.

Unchanged Alderney inputs reuse R, new attempt/receipt; only Alderney effective hash changes its R. Existing Albania/Andorra/LatAm/NZ rows cite their own L/R and remain unchanged. No importing those lineages in this task. Europe remains default; Russia excluded; no UI/cutover changes.

For Alderney regional filter, stored tier=regional matches **zero offices**, despite two dated other-tier contests. Label **“No regional tier in this package; two territorial office/contest records classified other.”** Regional denominator is unknown; do not invent percent coverage. Conditional other-tier dates may be shown in an appropriately labelled other-tier view later, but not counted as regional. Municipal completeness is not a gate.

## Verification boundary

Read-only package validator and source-byte checks passed; all source rows, prospective date bindings, historical heading sections, public identity vectors and 223-column coverage checked against frozen package/current SQL. Companion validation.json records documentation checks. Future Alderney importer, SQLite load, publication path and application CI: **Not run**. No tier bytes, statuses, DDL, frozen inputs, approved overrides or repository worktree files changed. No importer code or VPS work.
