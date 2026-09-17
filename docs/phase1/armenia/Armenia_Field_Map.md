# Armenia → Atlas master field map

**Prompt L documentation draft for Cursor implementation, after finalized Part 1 tier approval.** Pinned current main: `7af805b5dbb123c4cd3f0e6ccd2ea63bc5f34d45`, repository `FTFNAnalytics/digitaldemocracy`, inspected 2026-09-17. The main ref and recursive tree were read through GitHub; needed local bytes were verified against that immutable tree's git blob IDs. A shell git fetch did not complete; no moving local branch is used as the baseline. Main includes PR #23's Andorra importer merge. Governing inputs: docs/atlas-plan.md, Prompt B migrations, current lib/atlas/identity.ts and Armenia bridge adapter, plus checked-in Albania/Andorra/Alderney field-map contracts. Armenia is Europe #4 and the last early target. No locked decisions reopened.

Part 1 changes only the deliverable copy of `schemas/atlas/tiers/armenia.json`: predecessor `9b100ffab2b9f878914721711d4878567868bd5ac923b294af02ef15bbfaefe5` → **approved `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`**. Its 71 IDs equal the frozen register exactly; all municipal, zero regional. Approval is explicitly authorized by the user's Prompt L. Five boundary/calendar reviews remain open separately from geographic-tier approval. The repository and all frozen bytes remain unchanged. This pack does not claim its approved bytes are already on main.

This map covers **223 destination columns across20 master/ledger tables**, plus every column in all 14 supplied workbook tables. See [identity rules](Armenia_Identity_Rules.md), [acceptance examples](Armenia_Acceptance_Examples.md), [checklist](Prompt_L_Tiers_Field_Map_and_CI.md), [input inventory](Armenia_Input_Inventory.json) and [complete ID/locator vectors](Armenia_Identity_Vectors.json). SQL/importer/publication execution is **Not run**.

## Baseline

| Recomputed count | Value |
| --- | ---: |
| current_offices | 71 |
| historical_offices | 0 |
| geographies | 71 |
| proportional_councils | 55 |
| majoritarian_councils | 8 |
| existing_mayor_offices | 8 |
| selected_histories | 33 |
| offices_with_histories | 31 |
| prospective_events | 30 |
| total_events | 63 |
| research_dates | 63 |
| result_rows | 97 |
| offices_without_recorded_histories | 40 |
| unknown_next_dates | 41 |
| control_observations_supplied | 0 |
| poll_records_supplied | 0 |
| master_source_catalogue_rows | 15 |
| companion_source_catalogue_rows | 19 |
| distinct_catalogue_sources | 19 |
| inline_only_sources | 1 |
| sources | 20 |
| office_briefings_retained | 71 |
| country_briefings_retained | 1 |
| municipal_offices | 71 |
| regional_offices | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| outer_package_files | 8 |
| payload_member_files | 91 |
| retained_inputs | 100 |

The 71 rows include **55 proportional councils, 8 majoritarian councils and 8 actual mayor offices**. Preserve all existing mayor IDs; do not invent mayor counterparts for proportional councils.33 H histories overlap all 33 IX histories exactly by office/year/ballot key; they are not 66 events.30 already-existing bridge next IDs bring total events to 63.40 offices have no selected history, not evidence that no elections happened.

D has 97 rows: votes95 positive/2 missing; shares77 positive/20 missing; seats2 positive/95 missing. **No numeric zeros are supplied** in these three columns. Missing control/poll collections are not observed zero control or zero polls. All 33 H Competition eligible flags are false. Score/volatility/poll-watch inputs remain retained raw; no computations or metric tables.

Coverage remains partial: outer coverage.status/remaining and country notes state gaps; M has no coverage_complete boolean. Project research_coverage_complete=0 from explicit gaps, preserve website_ingestion=pending as source metadata. No geometry or complete municipal-research claim. Empty regional calendar is labelled **“No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.”** It passes the zero-regional gate.

## Source notation and raw retention

P=`data/countries/armenia/`; V=P+`unpacked/` is a **virtual retained member prefix**. Actual tracked files are packed; never claim V is a git directory. Recover V+entry by verifying and concatenating manifest chunks in manifest order, gunzipping the verified payload, then reading exact tar entry. Reject absolute/traversal/duplicate member paths, links and unexpected files; enforce declared lengths/hashes before projection. Do not execute package scripts, formulas or HTML. The supplied validator was run for documentation verification only.

| Alias | Exact location |
| --- | --- |
| M | P+manifest.json |
| O | V+tables/master/office-register.json |
| J | V+tables/companion/jurisdictions.json |
| H | V+tables/companion/histories.json |
| IX | V+history-index.json; reconciliation only |
| D | V+tables/companion/full-results.json |
| SM / SC | V+tables/master/sources.json / tables/companion/sources.json |
| Cal / Nts | V+tables/master/election-calendar.json / country-notes.json |
| BF | V+Office_Briefings/Offices/{exact office_id}.html |
| T | schemas/atlas/tiers/armenia.json; finalized approved Part1 bytes |

Workbook table pointer is `/rows/i/j`, with j=columns.indexOf(exact column), sheet=table.sheet, source_row=table.source_rows[i], never guessed i+2. IX pointer is `/i/escaped_key`. For each locator store `{input_path,archive_entry,sha256,json_pointer,sheet,source_row,column,html_anchor_index}`; unused values NULL, root pointer empty string. archive_entry is present for virtual members only; recovery binds it to M.payload_sha256 and outer chunk hashes. JSON-pointer escaping follows RFC6901. HTML external anchors use zero-based document-order anchor index; no scripts are run. Every input descriptor/hash is listed in inventory.

Raw envelope: `{origin:locator,row:original_object,columns:original_columns_or_null,values:original_row_or_null,supplemental:items_with_own_locators}`. Preserve exact source strings, numbers, nulls, source_rows, unknown columns and array order. There is no new extensions column: existing raw_json and retained_input.payload_json plus immutable bytes preserve upstream extensions. Each JSON input is retained whole; scripts/HTML/XLSX/chunks have payload_json=NULL and recoverable bytes. Formula caches are retained without recalculation.

Common policy: source null→SQL NULL unless a required status says unknown; optional blank scalar→NULL, original retained raw. Required identity blanks, duplicate keys/columns, malformed row shapes, invalid/nonfinite numbers, invalid dates and broken FKs fail closed. Do not trim/normalize IDs. Owning lineage L=country-package-armenia; N=cdd-observatory-v1; R is the effective fingerprint release, never attempt_id. Empty proceeding/party_mapping means **no row for every column**, not fabricated required values. Rows from unrelated lineages remain byte/logically unchanged.

## dataset_lineage

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + bridge packageRelease | Fixed `country-package-armenia`; never a per-run ID. | L; PK | One source-dataset lineage, not one continent. |
| provenance_kind | M + inventory/README package contract | country_package; require armenia-packed-europe/1 structure. M has no schema_version field. | L | Reject fixture/unknown provenance; verify packed payload before reading rows. |
| description | M.country | `Armenia frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | All P files + T + applicable override files + version contract | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-armenia-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_snapshot | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Copy 2026-09-11; do not substitute M.packaged or attempt timestamp. |
| upstream_release_id | europe.ts packageRelease(inventory).id | Copy existing `country-package-armenia`. | R | Legacy alias retained; not new Atlas release ID. |
| validated_counts_json | Recomputed O/J/H/D/SM/SC/Cal/BF and bridge next identities | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | 71 offices,33 selected+30 prospective=63 events,97 results,20 canonical sources; full inventory below. |
| research_coverage_complete | coverage.status/remaining and Nts.Scope and remaining gaps | 0, from explicit remaining coverage gaps; M has no coverage_complete boolean. | R | No invented coverage_complete source property; coverage remains partial. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve M.website_ingestion=pending and original coverage gaps; documentation is not live publication status. |

## retained_input

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | 8 tracked P files + 91 unpacked members + approved T | P paths for outer files; V= P+unpacked/ followed by exact tar member path for members; T unchanged logical path. Inherited paths per Identity Rules. | (L,R,input_path) | 100 distinct effective inputs. V is a documented virtual member path, not a claim that these files are checked into git. |
| input_kind | Path class | T=tier_classification; HTML/XLSX/payload chunks=artifact; other outer/member files=package; accepted future overrides=override. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | Verify chunk lengths/hashes, concatenated gzip hash, inventory and all member hashes; original bytes, never JSON serialization. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | sha256:<sha256> immutable content store; virtual member also records payload hash, exact archive_entry and pinned outer chunks in inventory. | (L,R,input_path) | All bytes recoverable and rehashed before publication; no dependency on temporary unpack directory. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | Lossless for every JSON including score gates/formula caches; other formats NULL with bytes retained. No fabricated control/poll table. |

## country

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | M.country; bridge slug | Literal `armenia`, existing ID. | country_id | No new country from shared Read me text. |
| country_code | Not supplied as a separate code field | NULL. | country_id | Office AM prefixes do not authorize inventing a country-code value. |
| name | M.country | Copy `Armenia`. | country_id | Nonempty. |
| polity_kind | Country Armenia in M and accepted Europe plan | sovereign_country. | country_id | No new country or territorial parent from other-country regional methodology. |
| region_id | Accepted Europe package/plan | europe. | country_id | Geographic landing region, not office tier. |
| coverage_status | coverage.status/remaining + Nts.Scope and remaining gaps | partial. | country_id | Explicit remaining gaps, not a nonexistent M.coverage_complete field. |
| screening_as_of_label | No separate Armenia screening-as-of field | NULL; research_checked_through belongs to release. | country_id | NULL; M.research_snapshot belongs to dataset_release. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Municipal consolidation/older returns/2027 decree gaps preserved verbatim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `armenia`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction + O.Office + bridge key | G=key("geo",["armenia",Jurisdiction,Office]); frozen bindings retained thereafter. | (country_id,G) | 71 bridge geography IDs: office type participates; no merge of mayor/council bindings by place name. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent geography supplied; NULL. No province/geometry fabrication. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row for this G | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | Exact register set of71:55 proportional councils,8 majoritarian councils,8 existing mayors. No extra mayor IDs. |
| country_id | O.Country + M.country | `armenia`; exact Armenia label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N,office_id) | FK (armenia,G); preserve all71 office-specific bridge bindings. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O.Office | Exact O.Office: proportional municipal council, majoritarian municipal council or Mayor, using original wording. | (N,office_id) | Office type is separate from tier; council-elects-mayor stays one supplied office. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date + matching J.Next date/Notes/Calendar source | 30 nonnull dates point to prospective event ballot date_id; 41 null dates→NULL. | (N,office_id) | No generic cohort endpoint or term expiry substituted for unknown next date. |
| next_date_resolution | Same date inputs | resolved for30 source-bound dates; unknown for41 null dates. | (N,office_id) | Source-reported called certainty remains independent of precision/resolution; future competing claims→conflicting and NULL selected pointer. |
| next_history_key | Existing bridge upcoming event for O.Next polling date | key("next",office_id) only for30 supplied next dates; NULL for41. | (N,office_id) | FK full namespaced event key; no fabricated next event for unknown date baseline. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row plus matching J row and BF artifact locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | municipal→municipal for all71. National→national_context; unknown→NULL if explicitly supplied later. | (N,office_id) | 71 municipal,0 regional; reject unsupported legacy unused council tier value; never classify from cohort labels. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | Known tier: approved only if accepted T.status="approved" and neither row flag true; otherwise needs_review. Unknown tier→unknown. | (N,office_id) | All71 tier rows approved by Prompt L. Five nested boundary_calendar_review flags are research scope, not row-level tier flags; preserve them raw. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/armenia.json`. | (N,office_id) | Approved JSON emitted by Part1 of this pack; not yet claimed committed on main. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Accepted T bytes | Exact approved bytes SHA-256 2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a. | (N,office_id) | Must match finalized Part1 bytes and retained-input FK; predecessor draft hash is audit only. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| date_id | H or O prospective event ballot owner | `date-`+SHA(C([N,"event",event_id,"ballot"])); office next pointer reuses prospective event date_id. | date_id | 63 baseline date owners,33 historical+30 prospective; office next date reuses event owner. |
| label | H.Actual ballot date, if recorded; O.Next polling date | Copy exact ISO label. If later H date absent, explicit H.Year may supply year precision only. | date_id | All63 supplied baseline event dates have day precision;41 unknown office next dates create no fabricated event. |
| precision | Full-string date grammar | day for all63 baseline events. Later month/year/range/unknown retain precision. | date_id | No month/year promotion to day1; validate actual Gregorian day. |
| certainty | H actual return context; prospective matching J.Notes and J.Calendar source | Histories unknown;30 prospective called as source-reported CEC day/community confirmation, not independent primary legal verification. | date_id | Each prospective J row explicitly says CEC day and community confirmed; retain news source grade. No global Cal status applied to all offices. |
| year | H/O parsed date label | Integer 1..9999; NULL if unknown or range. | date_id | H date year agrees with H.Year; upcoming2026 dates agree with O/J. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future actual ranges use slot+/start. | date_id | Calendar cohort first/end are not a per-office range. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future actual ranges use slot+/end. | date_id | No November date attached to null office dates. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H date/year row or O date with matching J.Notes/Calendar source locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## election_event

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | H or O prospective office identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H.Jurisdiction ID or O.Office ID | Copy exact. | (N,office_id,history_key) | FK office; every H row resolves. |
| history_key | H.Jurisdiction ID/Year/Actual ballot date, if recorded; O.Office ID for next | Historical HK formula in Identity Rules; next HK=key("next",office_id). | (N,office_id,HK) | 33 H keys exactly equal33 IX keys; IX adds zero.30 distinct next identities. |
| event_id | Existing bridge history or next event identity | History key("event",["armenia",HK]); prospective key("next",office_id). | (N,event_id) | 63 existing bridge event IDs preserved; no attempt/release in identity. |
| date_id | H or O mapped research_date | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | 63 date rows; same next date_id also used by office. Future conflicting selected pointer withheld; claims retained. |
| date_resolution | Parsed historical or prospective date + documented conflicts | resolved for all63 baseline events; future no usable date→unknown, competing claims→conflicting. | (N,office_id,HK) | Resolved means a single source-labelled value, not independently certified polling date. |
| event_kind | H.Round / basis; prospective no dedicated kind | Ordinary election; prefix→ordinary (22); Replacement election after mass council resignations;→special (1); Local election;→unknown (10); next→unknown (30). | (N,office_id,HK) | Vedi March2022 is separate actual replacement election, not a fictional proceeding; no kind guessed from coverage text. |
| selected_history_role | H membership versus O next | 33 H rows selected;30 next none. | (N,office_id,HK) | IX and HTML contexts add no duplicate selected events; older predecessor context not a third comparable cycle. |
| electoral_system | No dedicated historical system field | NULL baseline; office_type/notes retain current proportional or majoritarian wording. | (N,office_id,HK) | Do not back-project current office system to older elections; ballot denominator is not electoral system. |
| comparability | H.Coverage plus exact IX.Comparability status by HK; next O.Historical coverage | Historical nonempty strings joined with literal space·space; next verbatim O.Historical coverage. | (N,office_id,HK) | All33 competition_eligible=false retained raw; no three-cycle score or comparable assertion. |
| ballot_basis | H.Round / basis and matched D.Vote basis | Valid candidate/list votes suffix→valid_votes (22); incomplete vector or seats-only→unknown (11); next→unknown. | (N,office_id,HK) | No denominator inferred for partial or seats-only records. |
| share_unit | Existing bridge share unit; H/D percent values | percent_0_100; no numerical rescaling, even when all shares absent for an event. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | H.Coverage; prospective as of M.research_snapshot | Full reported vector; contemporary provisional...→preliminary (22); other11 histories→unknown;30 next→not_held as of snapshot. | (N,office_id,HK) | No certification inferred from URLs; future events not_held does not mean canceled. |
| record_state | Selected H or supplied O prospective membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row + exact IX row or O row + J row; D rows remain own raw | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## proceeding

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Armenia package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | D.Jurisdiction ID | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D.Jurisdiction ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D.Jurisdiction ID/Year/Actual ballot date, if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | All97 D rows resolve to exactly one of33 H keys; never office+year alone. |
| result_row_id | Bridge per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | Never reassign index after sorting by votes or after refresh omission. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Jurisdiction ID joined to O.Country; no Country column in D | `armenia`. | (N,result_row_id) | Composite FK enforces office country. |
| candidate_or_list_label | D.Party / list, then D.Candidate / ticket | First supplied nonempty label, exact; NULL if neither. Candidate field retained raw. | (N,result_row_id) | All97 have party/list and null candidate; no invented Unlabelled source row. |
| original_party_label | D.Party / list | Exact string or NULL; no coalition expansion. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | Existing bridge partyCode=D.Party / list | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Preserved combined source label/code convention, not a standardized party identifier. |
| party_namespace | D.Year + country package source scope | `armenia/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Existing bridge namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 95 positive integers,2 null; no reported zeros in baseline. No unique-elector claim beyond source basis. |
| votes_status | D.Votes null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | 77 positive,20 null,0 reported zero; never derive from partial totals or seat counts. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 2 positive values(16,11),95 null,0 reported zero. No inferred elected_flag. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | Matched H.Coverage plus D.Vote basis | preliminary if matched H says preliminary/provisional; otherwise recorded when any of votes/share/seats supplied, else unknown. | (N,result_row_id) | All97 contain at least one supplied numeric value. Seats-only rows remain recorded evidence with votes/share unknown; values/status independent of preliminary. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | SM/SC rows or actual inline occurrence | `armenia`. | (armenia,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-armenia`. | (armenia,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | Union SM/SC Source ID + actual inline URL | Catalogue `armenia--` + Source ID; inline-only `armenia--` + key("url",exact URL). | Source tuple | 34 physical catalogue rows→19 canonical IDs;15 exact duplicates reconciled. Add only1 genuine inline source=20. |
| publisher | No dedicated publisher column; inline lacks metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | SM.Title or SC.Title / dataset | Verbatim; duplicate source rows agree after header normalization; inline-only NULL. | Source tuple | Conflicting future same-ID metadata fails review; no invented publisher/title. |
| url | SM.Source URL or SC.URL; genuine inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | Exact unique catalogue URL match; no fetching or claiming current availability. |
| checked_as_of_label | SM/SC.Accessed | 2026-09-08 catalogue; inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | SM/SC.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | All SM/SC rows belonging to source or actual inline occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | armenia except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party mapping target; party/list strings stay election-scoped result context. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-armenia for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator) defined in Source notation; includes member archive_entry, exact source_rows[i], pointer and SHA. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | armenia. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-armenia. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H source→event/date; D→result; O/J calendar→office calendar_context and next event/date where present; Cal/Nts→calendar_context; BF→artifact_reference; accepted override→override. | evidence_id | No invented control/poll claims; CRRC screening reference is not a poll observation. |
| date_claim_id | H ballot date or O prospective ballot date; future independent claim | Actual date_id only when claim_kind=date; otherwise NULL. | evidence_id | 30 next claims include J confirmation-note locator and URL, same date_id as office; H33 claims keep own dates. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | `preserved_bridge_id`, `package_source_id`, `exact_url_catalogue_alias`, `baseline_row_binding`, or `documented_identity_correction`. | Crosswalk PK | Correction requires retained override; no undocumented reassignment. |
| lineage_id | Owning package M / staged lineage | `L = country-package-armenia`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Armenia row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination column | Source path alias / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Armenia. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## Event attachment, certainty and overlap

Join O↔J by exact office ID, not physical row index. All 71 IDs agree. For30 nonnull O.Next polling date cells, J.Next date agrees and J.Notes explicitly says “CEC day and community confirmed.” Attach only those30 dates; use precision=day, certainty=called **as reported by the frozen secondary source**, date_resolution=resolved. Exact calendar news URLs and evidence grades remain attached. This maps stronger office-specific evidence than the legacy bridge's concatenated cohort-status heuristic; it preserves every public next ID. It is not a fresh verification of enacted decrees. All 33 historical dates use precision=day, certainty=unknown; preliminary result status is independent of date precision.

41 null next dates remain NULL/unknown with next_history_key=NULL. Cal cohort First/End dates, including November29, are not generic per-office dates or event ranges. J.Term expiry is not a polling day (all baseline cells null). A later explicit YYYY-MM or YYYY date retains month/year precision, no fabricated day. Parse complete ISO/calendar label with actual Gregorian validation, never extract a year from arbitrary prose. Future ranges need supplied non-range ordered endpoints, no cycles; filter interval overlap without creating day1. Conflicting source claims retain both evidence/date-claim rows and withhold the single office/event pointer (and office.next_history_key) with resolution=conflicting.

Select H as authoritative detailed histories where supplied; reconcile IX by exact HK. This frozen baseline has identical33-key sets. Compare date/year/source URLs and preserve divergent coverage/comparability fields raw; any contradictory identity/value claim is review/fail-closed, not last-wins. An office lacking H can use a genuinely supplied IX-only history under the same identity rule in a future version, but must not manufacture D rows from summary leaders. D joins by full office/year/ballot key. No blanket “one election per year.” Vedi December2021 and March2022 are two actual events; Vedi2016 narrow predecessor context remains briefing/J narrative, not a third selected event. H.Actual election return=true for 33 and Competition eligible=false for 33; preserve both flags.

Event kinds use H.Round / basis, not a generic “local” label or office-name regex.22 ordinary, 1 special(Vedi replacement), 10 unknown. Current council system descriptions stay office_type/raw; do not back-project to historical event.electoral_system. No proceedings or party concordance are supplied. Party/list strings preserve bridge codes and election-year namespaces but imply no cross-year coalition equivalence. H leader/runner summaries are not extra result rows.

## Tier approval and five retained research reviews

Part1 approves the existing municipal assignments under explicit Prompt L authorization. The 66 other classification rows are unchanged as JSON objects. Five rows clear only outer tier-review flags and append rationale; their original review metadata and exact J.Notes/calendar citation move into a scoped `boundary_calendar_review` object with status=open and human_review_required=true. That nested flag must not be interpreted as tier uncertainty. All 71 typed tier review_status values are approved; five research reviews remain open. Approval does not enact a merger, postpone a ballot or confirm a boundary roster.

| Office | O / J row pointer | Research issue retained |
| --- | --- | --- |
| AM-ARARAT-C | `/rows/9/3` / `/rows/13/20` | 2026 cohort. Exact community polling day remains to be confirmed. The public elects the council; there is no separate direct mayoral ballot. Municipal mergers and the switch from majoritarian to proportional voting prevent automatic comparisons with predecessor towns. A further merger proposal requires monitoring before the ballot roster is final. |
| AM-MASIS-C | `/rows/44/3` / `/rows/14/20` | 2026 cohort. Exact community polling day remains to be confirmed. The public elects the council; there is no separate direct mayoral ballot. Municipal mergers and the switch from majoritarian to proportional voting prevent automatic comparisons with predecessor towns. September 2026 reports of a proposed delay require enacted-law verification; no postponement is assumed. The latest reported top-two list margin is at most 10 points: competitive coalition formation watch; three-cycle index withheld. |
| AM-PAMBAK-C | `/rows/52/3` / `/rows/31/20` | 2026 cohort. Exact community polling day remains to be confirmed. The public elects the council; there is no separate direct mayoral ballot. Municipal mergers and the switch from majoritarian to proportional voting prevent automatic comparisons with predecessor towns. A further merger proposal requires monitoring before the ballot roster is final. |
| AM-VANADZOR-C | `/rows/65/3` / `/rows/27/20` | 2026 cohort. Exact community polling day remains to be confirmed. The public elects the council; there is no separate direct mayoral ballot. Municipal mergers and the switch from majoritarian to proportional voting prevent automatic comparisons with predecessor towns. September 2026 reports of a proposed delay require enacted-law verification; no postponement is assumed. A further merger proposal requires monitoring before the ballot roster is final. |
| AM-VEDI-C | `/rows/68/3` / `/rows/15/20` | 2027 cohort. Exact community polling day remains to be confirmed. The public elects the council; there is no separate direct mayoral ballot. Municipal mergers and the switch from majoritarian to proportional voting prevent automatic comparisons with predecessor towns. A further merger proposal requires monitoring before the ballot roster is final. The March 2022 replacement election follows a December 2021 council poll; both are actual separate elections. The latest reported top-two list margin is at most 10 points: competitive coalition formation watch; three-cycle index withheld. The consolidated municipality began in 2021; 2016 town council (5 RPA, 1 PAP, 5 independent councillors) is predecessor context on narrower boundaries and is not inserted as a third comparable cycle. |

`AM-VEDI` without council suffix is a legacy prompt token in preserved review text only; never create it as an office ID, geography source-code or crosswalk alias. Existing eight mayor IDs remain; proportional councils do not gain mayor rows. The legacy unused “council” metadata vocabulary is not an accepted schema-v1 geographic tier and is never emitted to SQL.

## Sources and evidence traversal

SM has 15 rows, SC19; normalized same-ID title/URL/grade/access date agree for all 15 overlaps. Canonical union=19 sources. Master source-links lists5 URLs absent from SM, but4 resolve to SC; only CRRC screening URL is genuinely inline-only. Canonical source total20. Do not create five extras, or country-name/publisher placeholders. Exact source metadata and URL aliases survive; catalogue grade is not publisher, and table-file SHA is not source webpage SHA. No remote pages were downloaded or freshly certified.

| Occurrence | Typed target / claim | Rule |
| --- | --- | --- |
| H.Source ID and Result source URL | event; event and date claims | Both must resolve consistently; each occurrence retains its own pointer; date claim references ballot date_id |
| D.Source ID and Source URL | result_row; result | Both resolve consistently; retain vote basis and H preliminary qualifier |
| O.Calendar evidence and J.Calendar source | office calendar_context; next event event/date if a next event exists | Exact ID-joined J note and date locators accompany the claim; no event for null date |
| Cal.Source URL | retained Cal input; calendar_context | Keep cohort row/counts raw, not all-to-all legal confirmation |
| Nts.Screen evidence | country; calendar_context | CRRC reference is screening context, not an invented poll record |
| BF/country HTML external href | artifact input; artifact_reference | Inert parse, exact anchor index/hash; all actual external URLs resolve to20-source union |
| J.Poll source | office; poll only if supplied | All null baseline; no fabricated evidence row |
| T | mandatory classification retained-input FK | Typed tier points to finalized approved hash; scoped review locators retained in raw |
| SM/SC/source-links/index/formula caches/workbook references | input/source provenance | No all-to-all citation support; workbook basename is artifact reference, not HTTP URL |

Catalogue token resolution precedes exact unique URL resolution; ID/URL disagreement fails for review, never silently chooses one. Real unmatched HTTP URLs can form inline sources with missing metadata NULL. Malformed/unmatched/ambiguous citation tokens become unresolved_evidence against a real record_locator, with original token, reason and exact occurrence locator. Previously resolved known source missing from staging is a fatal FK failure, not an unresolved token. Blank fields/relative navigation are not evidence tokens. Baseline designated references resolve; expected unmatched-token count0 is not a completeness claim.

## Operational publication and schema notes

schema_migration remains migration-controlled version1/PRAGMA user_version1 in master and ledger; no research mapping or DDL changes. Create a fresh durable attempt in separate ledger before staging. Copy the last good master to same-filesystem staging, preserving every unrelated lineage/release pair and rows. Apply only Armenia's effective data with deferred FKs; validate all constraints, fixture exclusion and counts before commit. Complete WAL checkpoint, close database handles, verify no uncheckpointed WAL dependency, fsync database and parent directory, then atomic rename and directory fsync. Keep prior good snapshots. Failed staging leaves prior master serving and durable failed attempt intact. Receipt binds actual attempt to selected Armenia release; recover crash-after-rename from receipt before marking succeeded/failed. No claim that this document executed publication.

Unchanged effective inputs produce a new attempt but same release_id. Incomplete input is not authorization to delete prior office/event/result/source/tier/evidence rows; carry forward provenance/input bytes into effective fingerprint. A broken resolved source cannot be reclassified unresolved to make import pass. Fixture IDs FIX-/FXT- or fixture provenance must never enter publication. Approved tier hash must exactly match Part1; no tier derived from “Regional / municipal” workbook strings. Regional count0 passes.

## Complete source-column disposition

Every column below is preserved in the full retained_input JSON and row raw envelope when projected. “Retained only” means no metric, poll, control, proceeding or fictitious typed field is created. Table aliases above provide byte paths; column ordinal j is explicit. Unknown future columns default to lossless raw retention and validation/review, not new SQL columns.

### tables/companion/briefings.json

71 rows; sheet `Briefings`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Jurisdiction ID | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Country | retained_input.payload_json only; no derived SQL metric or invented field |
| 2 | Jurisdiction | retained_input.payload_json only; no derived SQL metric or invented field |
| 3 | Election briefing | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/companion/full-results.json

97 rows; sheet `Full results`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Jurisdiction ID | result_row.office_id/event join |
| 1 | Year | HK + party_namespace |
| 2 | Party / list | candidate_or_list_label, original_party_label/code; semantic binding |
| 3 | Candidate / ticket | label fallback, semantic binding and raw; all null baseline |
| 4 | Votes | votes/votes_status |
| 5 | Share | share/share_status; percent_0_100 |
| 6 | Seats | seats/seats_status |
| 7 | Source ID | source/evidence_link result |
| 8 | Source URL | source/evidence_link result |
| 9 | Actual ballot date, if recorded | HK + exact event join |
| 10 | Election cycle key | semantic result binding; raw |
| 11 | Vote basis | crosscheck H ballot_basis; raw |

### tables/companion/histories.json

33 rows; sheet `Histories`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Jurisdiction ID | election_event.office_id |
| 1 | Country | country assertion |
| 2 | Jurisdiction | retained_input.payload_json only; no derived SQL metric or invented field |
| 3 | Year | HK + date year check |
| 4 | Leader / ticket or party | retained_input.payload_json only; no derived SQL metric or invented field |
| 5 | Leader party | retained_input.payload_json only; no derived SQL metric or invented field |
| 6 | Leader vote share | retained_input.payload_json only; no derived SQL metric or invented field |
| 7 | Runner-up / party | retained_input.payload_json only; no derived SQL metric or invented field |
| 8 | Runner party | retained_input.payload_json only; no derived SQL metric or invented field |
| 9 | Runner vote share | retained_input.payload_json only; no derived SQL metric or invented field |
| 10 | Gap, pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 11 | Leader seats | retained_input.payload_json only; no derived SQL metric or invented field |
| 12 | Round / basis | event_kind/ballot_basis; raw |
| 13 | Coverage | legal_outcome/comparability; result evidence_status |
| 14 | Source ID | source/evidence_link event/date |
| 15 | Actual ballot date, if recorded | HK + research_date label/components |
| 16 | Election cycle key | raw supplied cycle identity context |
| 17 | Result source URL | source/evidence_link event/date |
| 18 | Actual election return | validate actual selected return; raw |
| 19 | Competition eligible | raw score gate only |

### tables/companion/jurisdictions.json

71 rows; sheet `Jurisdictions`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Jurisdiction ID | exact join O; retain companion origin |
| 1 | Country | country assertion |
| 2 | Jurisdiction | crosscheck O; raw |
| 3 | Office | crosscheck O; raw |
| 4 | Next date | crosscheck O.Next polling date; date provenance |
| 5 | Result cycles | retained_input.payload_json only; no derived SQL metric or invented field |
| 6 | Latest available gap | retained_input.payload_json only; no derived SQL metric or invented field |
| 7 | Middle gap | retained_input.payload_json only; no derived SQL metric or invented field |
| 8 | Oldest gap | retained_input.payload_json only; no derived SQL metric or invented field |
| 9 | Weighted gap | retained_input.payload_json only; no derived SQL metric or invented field |
| 10 | Competition score | retained_input.payload_json only; no derived SQL metric or invented field |
| 11 | Historical flag | retained_input.payload_json only; no derived SQL metric or invented field |
| 12 | Pedersen interval 1 | retained_input.payload_json only; no derived SQL metric or invented field |
| 13 | Pedersen interval 2 | retained_input.payload_json only; no derived SQL metric or invented field |
| 14 | Mean grouped volatility | retained_input.payload_json only; no derived SQL metric or invented field |
| 15 | Margin dispersion proxy | retained_input.payload_json only; no derived SQL metric or invented field |
| 16 | Volatility flag / basis | retained_input.payload_json only; no derived SQL metric or invented field |
| 17 | Coverage status | retained_input.payload_json only; no derived SQL metric or invented field |
| 18 | Polling / government watch | retained_input.payload_json only; no derived SQL metric or invented field |
| 19 | Poll source | no value baseline; retain null; no poll rows |
| 20 | Notes | research_date certainty evidence and boundary/calendar raw review |
| 21 | Term expiry (not polling day) | raw only; never use as polling day |
| 22 | Calendar source | source/evidence_link |

### tables/companion/parameters.json

14 rows; sheet `Parameters`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Assumption | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Value | retained_input.payload_json only; no derived SQL metric or invented field |
| 2 | Meaning / source | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/companion/read-me.json

16 rows; sheet `Read me`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Field | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Value | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/companion/sources.json

19 rows; sheet `Sources`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Source ID | source.source_id + aliases |
| 1 | Title / dataset | source.title |
| 2 | URL | source.url |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

### tables/master/country-coverage.json

1 rows; sheet `Country coverage`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Country or territory | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Office records | retained_input.payload_json only; no derived SQL metric or invented field |
| 2 | Historical entries | retained_input.payload_json only; no derived SQL metric or invented field |
| 3 | Three entries | retained_input.payload_json only; no derived SQL metric or invented field |
| 4 | Competition scores | retained_input.payload_json only; no derived SQL metric or invented field |
| 5 | Grouped volatility scores | retained_input.payload_json only; no derived SQL metric or invented field |
| 6 | Sourced current control | retained_input.payload_json only; no derived SQL metric or invented field |
| 7 | Calendar cohorts | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/master/country-notes.json

1 rows; sheet `Country notes`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Country or territory | country identity assertion |
| 1 | Scope and remaining gaps | country.notes |
| 2 | Election calendar | retained_input.payload_json only; no derived SQL metric or invented field |
| 3 | Detailed workbook | artifact locator by exact XLSX hash |
| 4 | Screen evidence | country evidence calendar_context; genuine inline source |

### tables/master/election-calendar.json

2 rows; sheet `Election calendar`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Cohort ID | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Country | retained_input.payload_json only; no derived SQL metric or invented field |
| 2 | Election cohort | retained_input.payload_json only; no derived SQL metric or invented field |
| 3 | Tier | retained_input.payload_json only; no derived SQL metric or invented field |
| 4 | First or scheduled date | retained_input.payload_json only; no derived SQL metric or invented field |
| 5 | End or runoff date | retained_input.payload_json only; no derived SQL metric or invented field |
| 6 | Date status | retained_input.payload_json only; no derived SQL metric or invented field |
| 7 | Historical cycles | retained_input.payload_json only; no derived SQL metric or invented field |
| 8 | Coverage and timing | retained_input.payload_json only; no derived SQL metric or invented field |
| 9 | Prior-call units if known | retained_input.payload_json only; no derived SQL metric or invented field |
| 10 | Source URL | source/evidence_link to calendar input; calendar_context |

### tables/master/office-register.json

71 rows; sheet `Office register`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Office ID | office.office_id; tier join; identity_crosswalk |
| 1 | Country | country/office.country_id validation |
| 2 | Jurisdiction | geography.name; office.name; geography identity |
| 3 | Office | office.office_type/name; geography identity |
| 4 | Next polling date | office.next_date_id/resolution and prospective event/date if supplied |
| 5 | History entries | retained_input.payload_json only; no derived SQL metric or invented field |
| 6 | Latest eligible gap pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 7 | Middle gap pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 8 | Oldest gap pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 9 | Weighted gap pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 10 | Competition score | retained_input.payload_json only; no derived SQL metric or invented field |
| 11 | Historical competition screen | retained_input.payload_json only; no derived SQL metric or invented field |
| 12 | Pedersen interval 1 pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 13 | Pedersen interval 2 pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 14 | Mean Pedersen pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 15 | Margin dispersion pp | retained_input.payload_json only; no derived SQL metric or invented field |
| 16 | Volatility interpretation | retained_input.payload_json only; no derived SQL metric or invented field |
| 17 | Polling and government watch | retained_input.payload_json only; no derived SQL metric or invented field |
| 18 | Historical coverage | office.raw_json; prospective event.comparability |
| 19 | Detailed workbook | retained_input.payload_json only; no derived SQL metric or invented field |
| 20 | Calendar evidence | source resolver; evidence_link calendar/date |

### tables/master/parameters.json

12 rows; sheet `Parameters`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Assumption | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Value | retained_input.payload_json only; no derived SQL metric or invented field |
| 2 | Definition | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/master/read-me.json

13 rows; sheet `Read me`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Topic | retained_input.payload_json only; no derived SQL metric or invented field |
| 1 | Use and interpretation | retained_input.payload_json only; no derived SQL metric or invented field |

### tables/master/sources.json

15 rows; sheet `Sources`. Pointer `/rows/i/j`, original source row `source_rows[i]`.

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Source ID | source.source_id + aliases |
| 1 | Title | source.title |
| 2 | Source URL | source.url |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

### Other payload members and outer package inputs

IX all keys/values remain lossless retained JSON; its33 HKs reconcile with H, adding0 events. inventory.json and outer manifest provide hash/byte/recovery metadata. source-links.json retains exact URL lists and reconciliation note; formula-cache.json retains original formulas/attributes/caches with no evaluation. The XLSX and 72 HTML files retain exact bytes/hash; companion briefings table retains its full text/HTML references and unknown fields. The shared master Parameters/Read me tables are regional methodology, never Armenia office totals. Outer scripts/README/package attributes/chunks remain retained provenance only; eight outer files are enumerated in inventory. The original shared Europe ZIP/workbook hashes are recovery metadata, not a dependency to load other countries and not reverified from off-git originals in this prompt.
