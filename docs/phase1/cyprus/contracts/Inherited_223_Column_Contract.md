# Bosnia and Herzegovina → Atlas master field map

**Prompt O: documentation + tier draft only.** Main contract pin `6e6426fe17f6f542b58b68f8607124e007b852ff`; package PR #15 `codex/europe-bosnia-and-herzegovina` at `98408339e233e8580ec535cc24e8762ff5c6533f`. Bosnia is absent from that main tree. Immutable GitHub trees and all materialized blob IDs were checked; no PR merge or repository edit. Governing inputs: main docs/atlas-plan.md, Prompt B migrations, lib/atlas/identity.ts, Europe adapters/normalization and Albania/Andorra/Alderney/Armenia maps; Prompt N supplies the latest handoff pattern. No locked decision reopened. Europe-first, /atlas, SQLite VPS and Russia exclusion remain fixed; no redirects or /electiondatabase retirement.

T=`schemas/atlas/tiers/bosnia-and-herzegovina.json`, **draft_for_human_review**, SHA `3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1`. Register SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`, 5386 bytes. **13 proposed regional offices:10 canton assemblies+3 entity institutions; 0 national/municipal/other.** BA-G is the RS President, not Brčko. No Brčko office is supplied. Three entity rows have focused review flags; all 13 still need Justin's pack approval. No SQL/importer/publication execution.

Full 223-column/20-table contract below; schema_migration is migration-owned, not a research table. See [identity rules](Bosnia_Identity_Rules.md),[17 worked examples](Bosnia_Acceptance_Examples.md),[checklist](Prompt_O_Tiers_Field_Map_and_CI.md),[input inventory](Bosnia_Input_Inventory.json),[complete ID vectors](Bosnia_Identity_Vectors.json). Vectors are deterministic proposals for a future adapter, not evidence that Bosnia is already publicly ingested.

## Baseline

| Recomputed inventory | Count |
| --- | ---: |
| current_offices | 13 |
| geographies | 13 |
| entity_offices | 3 |
| cantonal_assembly_offices | 10 |
| regional_offices_proposed | 13 |
| municipal_offices_proposed | 0 |
| other_offices_proposed | 0 |
| approved_classifications | 0 |
| focused_tier_reviews | 3 |
| companion_offices | 0 |
| master_histories | 39 |
| index_histories | 39 |
| overlap_histories | 39 |
| selected_histories | 39 |
| prospective_events | 13 |
| total_events | 52 |
| research_dates | 52 |
| historical_dates_year | 39 |
| prospective_dates_day_expected | 13 |
| calendar_cohorts | 1 |
| detailed_return_rows | 749 |
| companion_full_result_rows | 0 |
| source_catalogue_rows | 28 |
| inline_only_sources | 2 |
| sources | 30 |
| office_briefings | 13 |
| country_briefings | 1 |
| poll_records_supplied | 0 |
| control_observations_supplied | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| outer_package_files | 7 |
| payload_member_files | 27 |
| retained_inputs | 35 |

The standalone IX 39 duplicates H 39 exactly after documented table-vs-CSV scalar normalization; it contributes **zero** events. 13 register next dates create 13 prospective projections, so total 52. All 13 offices are outside companion because **no companion workbook/tables exist**. This does not mean missing office data: H and D live under master. Manifest companion_full_result_rows=0 must not be mistaken for zero detailed returns; master/detailed-returns has 749.

D has 749 positive vote and share values; seats 293 positive/369 zero/87 NULL. Ten 2014 cantonal histories report major parties plus a published residual Others without within-Others detail. Keep those source rows intact; no split into invented parties. Coverage includes 2 other secondary transcriptions and 1 full candidate vector; title/grade and comparability qualifiers remain visible.36 histories have Eligible vote basis; 3 Unscored / inapplicable. None authorizes metric computation.

All 39 historical ballot cells are NULL (IX empty strings), so precision=year and certainty=unknown. All 13 O next cells explicitly say 2026-10-04; the one Cal row supplies **Scheduled cycle / expected; details vary**. Next precision=day, certainty=expected, not called/statutory. These are 13 possible regional calendar entries after tier approval, clearly labelled expected. Current approved Bosnia regional coverage is 0 because T remains draft; zero remains an allowed state.

## Source notation and raw retention

P=`data/countries/bosnia-and-herzegovina/`; V=P+`unpacked/` is a virtual member path, not a git directory. Verify ordered manifest chunks (one 75544-byte gzip chunk here), concat SHA, gunzip and safely read tar. Reject absolute/traversal/duplicate/unlisted paths, links, length/hash errors. Check inventory.json against M, then 26 other members against inventory.contents. Validator runs for package integrity only; no app/importer execution.

| Alias | Exact path |
| --- | --- |
| M / coverage | P+manifest.json / coverage.json |
| O | V+tables/master/office-register.json |
| H | V+tables/master/history-index.json |
| IX | V+history-index.json; reconciliation only |
| D | V+tables/master/detailed-returns.json |
| S | V+tables/master/sources.json |
| Cal | V+tables/master/election-calendar.json |
| Nts | V+tables/master/country-notes.json |
| BF | V+Office_Briefings/Offices/{office_id}.html |
| Country HTML | V+Office_Briefings/bosnia_and_herzegovina.html |
| T | schemas/atlas/tiers/bosnia-and-herzegovina.json |

Table pointer /rows/i/j with j=columns.indexOf(exact header), sheet=table.sheet, worksheet row=source_rows[i]. Never assume i+2. IX /i/key uses RFC6901 escaping. Locator `{input_path,archive_entry,sha256,json_pointer,sheet,source_row,column,html_anchor_index}` usesNULL for inapplicable components. Empty root pointer is valid. HTML external HTTP(S) anchor indices use zero-based external-anchor document order; no scripts execute. No master XLSX member exists; its verified original archive entry hash/bytes are recovery metadata, not a fabricated payload file.

Raw envelope `{origin:locator,row:original_object,columns:columns_or_null,values:row_array_or_null,supplemental:items_with_own_locators}` preserves every unknown field, source row, null, numeric precision and array order. Every JSON retained whole in retained_input.payload_json; non-JSON bytes retained by hash/recovery locator with payload_json=NULL. No new extensions column; existing raw_json and retained inputs carry all upstream extensions. Formula caches are retained without recalculation.

Common conversion: source null→SQLNULL except required unknown status; optional blank scalar→NULL with original raw. Identity strings never trim/normalize. Invalid/duplicate identities, malformed row/header, nonfinite or out-of-domain numbers, broken resolved FKs fail closed. L=country-package-bosnia-and-herzegovina; N=cdd-observatory-v1; CID=bosnia-and-herzegovina; R is effective release fingerprint. Empty proceeding/party_mapping means no row for every column, not dummy required values.

## dataset_lineage

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + proposed country-package identity | Fixed `country-package-bosnia-and-herzegovina`; never a per-run ID. | L; PK | One Bosnia and Herzegovina source-dataset lineage; no existing Bosnia and Herzegovina public release claimed. |
| provenance_kind | M + inventory/README package contract | country_package; frozen gzip-packed extract from PR #15. M has no schema_version field. | L | Reject fixture/unknown provenance; verify packed payload before reading rows. |
| description | M.country | `Bosnia and Herzegovina frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | 7 P files +27 V members +T +applicable accepted overrides +versions | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-bosnia-and-herzegovina-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_snapshot | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Copy 2026-09-11; do not substitute M.packaged or attempt timestamp. |
| upstream_release_id | Proposed package alias | country-package-bosnia-and-herzegovina; stable planned alias, not a claim of an already-public Bosnia and Herzegovina bridge release. | R | Keep separate from new content-derived R. |
| validated_counts_json | Recomputed O/H/IX/D/S/Cal/BF | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | 13 offices, 39 selected+13 prospective=52 events, 749 results, 30 canonical sources; see inventory. |
| research_coverage_complete | coverage.status/remaining and Nts. Scope and remaining gaps | 0, from explicit remaining coverage gaps; M has no coverage_complete boolean. | R | No invented coverage_complete source property; coverage remains partial. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve M.website_ingestion=pending and original coverage gaps; documentation is not live publication status. |

## retained_input

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | 7 tracked P files +27 V members +draft T | P paths for outer files; V= P+unpacked/ followed by exact tar member path for members; T unchanged logical path. Inherited paths per Identity Rules. | (L, R, input_path) | 35 candidate descriptors. Approval gate blocks draft publication. V is a virtual member path. |
| input_kind | Path class | T=tier_classification; HTML/XLSX/payload chunks=artifact; other outer/member files=package; accepted future overrides=override. | (L, R, input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L, R, input_path) | Verify one ordered gzip chunk length/hash, concat payload SHA, inventory and all 27 members. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L, R, input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | sha256:<sha256> immutable content store; virtual member also records payload hash, exact archive_entry and pinned outer chunks in inventory. | (L, R, input_path) | All bytes recoverable and rehashed before publication; no dependency on temporary unpack directory. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L, R, input_path) | Every JSON retained losslessly, including score/control summary counts and formulas. No poll/control collections supplied. |

## country

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | M.country + declared package slug | Literal bosnia-and-herzegovina. | country_id | No new country from shared Read me text. |
| country_code | extract.py CODE constant | BA; copy frozen extraction constant. | country_id | ID letters alone do not assign institution type or administrative parent. |
| name | M.country | Copy `Bosnia and Herzegovina`. | country_id | Nonempty. |
| polity_kind | Country Bosnia and Herzegovina in M and accepted Europe plan | sovereign_country. | country_id | No new country or territorial parent from other-country regional methodology. |
| region_id | Accepted Europe package/plan | europe. | country_id | Geographic landing region, not office tier. |
| coverage_status | coverage.status/remaining + Nts. Scope and remaining gaps | partial. | country_id | Explicit remaining gaps, not a nonexistent M.coverage_complete field. |
| screening_as_of_label | No separate Bosnia and Herzegovina screening-as-of field | NULL; no separately supplied screening-as-of date. | country_id | NULL; M.research_snapshot belongs to dataset_release. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Preserve RS replacement/repeat presidential and governing-coalition gaps verbatim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `bosnia-and-herzegovina`, after exact country-label check. | (country_id, geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction +O.Office +proposed bridge-compatible key | G=key("geo",["bosnia-and-herzegovina", Jurisdiction, Office]); frozen bindings retained thereafter. | (country_id, G) | 13 distinct proposed bridge-compatible Gs; two RS office-type bindings remain separate. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id, G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id, G) | No parent geography supplied; NULL. No province/geometry fabrication. |
| effective_from_label | Not supplied | NULL. | (country_id, G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id, G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row +T institution_scope with own locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Keep entity/canton distinction; no invented parent/geometry. |

## office

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N, O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N, office_id) | Exact set:BA-201…BA-210, BA-F, BA-R, BA-G. No Brčko or municipal office supplied. |
| country_id | O.Country + M.country | `bosnia-and-herzegovina`; exact Bosnia and Herzegovina label required. | (N, office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N, office_id) | FK to same-country G. BA-R assembly and BA-G president have distinct type-scoped Gs; no geopolitical parent invented. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N, office_id) | Both inputs retained raw. |
| office_type | O.Office | Exact Cantonal assembly / House of Representatives / National Assembly / President. | (N, office_id) | Geographic tier depends on jurisdiction+institution evidence in T, not office-title keyword National or President. |
| office_status | O membership in current register | `current`; baseline only. | (N, office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N, office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N, office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N, office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date plus exact matching Cal date/status | Corresponding prospective event ballot date_id for all 13. | (N, office_id) | 13 source O cells independently give 2026-10-04; Cal adds expected certainty, not tier or fresh confirmation. |
| next_date_resolution | Same date inputs | resolved for 13 single source-labelled dates, with expected certainty. | (N, office_id) | Resolved at day precision is not a certified legal call; conflicting future claim withholds selected pointer. |
| next_history_key | O.Office ID where Next polling date supplied | key("next", office_id) for 13. | (N, office_id) | FK full (N, office_id, HK); same next identity on date correction; no random IDs. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row +BF locator +T institution_scope +exact Cal qualifier locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N, office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N, office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | regional→regional for 13 rows; national→national_context if later supplied; municipal/other unchanged. | (N, office_id) | Ten canton assemblies+three entity offices; 0 municipal/other/national. Legacy council metadata is not supported SQL geographic tier and is never emitted. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | needs_review for all 13 because T is draft. Future accepted pack +clear row flags→approved; hold/null tier→unknown. | (N, office_id) | Three entity rows focused human_review_required=true; ten canton rows still need pack approval. No silent promotion. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N, office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/bosnia-and-herzegovina.json`. | (N, office_id) | Deliverable draft only, not claimed committed or approved. |
| classification_kind | Mapping contract | `tier_classification`. | (N, office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Exact T bytes | 3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1 | (N, office_id) | Candidate T bytes match retained-input FK. Approval changes byte hash and R. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| date_id | H event ballot or O next event ballot owner | date-+SHA(C([N,"event", event_id,"ballot"])); office next date reuses prospective event date_id. | date_id | 52 distinct date owners:39 historical+13 upcoming; no extra office-owned copies. |
| label | H.Ballot date if recorded fallback H.Year; O.Next polling date for next | Histories exact Year string (39); next exact 2026-10-04 (13). | date_id | H ballot-date cells allNULL; IX empty strings stay raw; never infer historical day from year or URL. |
| precision | Full-string date grammar | year for 39 histories; day for 13 next events. | date_id | Future YYYY-MM stays month, no day1; unknown/range remain explicitly represented. |
| certainty | History has no explicit certainty; next Cal. Date status exact matched row | Historical unknown; next expected from Scheduled cycle / expected; details vary. | date_id | No called/statutory inference from CEC homepage or scheduled day string. |
| year | Historical H.Year or parsed O.Next polling date | Integer 1..9999; NULL if unknown or range. | date_id | History2014/2018/2022; prospective2026. Actual calendar validation; no snapshot fallback. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/start. | date_id | No cohort range inferred; Cal End or runoff date isNULL. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future explicitly supplied endpoint gets slot ballot/end. | date_id | Endpoints must be ordered/noncyclic actual claims, not day1 padding. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H year/null date +IX counterpart; next O date +Cal status/date/URL locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Preserve original certainty phrase and source nulls. |

## election_event

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | H or O office identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N, office_id, history_key) | Same as office. |
| office_id | H.Office ID or O.Office ID | Copy exact. | (N, office_id, history_key) | Every history/next target in O; all event FKs carry namespace+office+HK. |
| history_key | H.Office ID/Year/Ballot date if recorded; O.Office ID for next | Historical HK tuple; next HK=key("next", office_id). | (N, office_id, HK) | 39 H keys equal39 IX keys; IX adds0 events.13 next identities are distinct. |
| event_id | Proposed deterministic bridge-compatible identity | History key("event",[CID, HK]); next key("next", office_id). | (N, event_id) | 52 proposed bridge-compatible IDs; no claim of already-public Bosnia IDs. |
| date_id | H or O projected research_date | Own ballot date ID, including unknown-date row if label absent. | (N, office_id, HK) | 52 date FKs. Unknown future event date still requires explicit unknown date row; conflict requiresNULL selected pointer. |
| date_resolution | Parsed historical or prospective date + documented conflicts | resolved for 52 at supplied precision; future no date/year→unknown with explicit unknown date row; conflict→conflicting. | (N, office_id, HK) | A resolved expected date is not confirmed. |
| event_kind | No explicit structured event-kind column | unknown for all 52. | (N, office_id, HK) | Do not infer proceeding or special election from the unresolved replacement/repeat research note. |
| selected_history_role | H membership or O future date | 39 histories selected; 13 next none. | (N, office_id, HK) | History-index crosscheck/HTML adds no duplicates. Three regular cycles are not complete replacement-event coverage. |
| electoral_system | No dedicated historical system field | NULL; no separate explicit system field supplied. | (N, office_id, HK) | Do not infer from office name, vote basis or current council structure. |
| comparability | H.Coverage +H.Comparability status; next O.Historical coverage | Join historical nonempty strings with literal space·space; next O.Historical coverage verbatim. | (N, office_id, HK) | 36 Eligible vote basis /3 Unscored / inapplicable; preserve residual Others and partial comparability; no score computed. |
| ballot_basis | H.Vote basis crosschecked D.Vote basis; no upcoming basis | Valid candidate/list votes→valid_votes for 39; next unknown. | (N, office_id, HK) | No recomputation or assumption of complete party decomposition. |
| share_unit | H/D supplied percentage convention | percent_0_100; no rescaling. | (N, office_id, HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | No explicit historical legal outcome; future as of research snapshot | unknown for 39 histories; not_held for 13 next as of 2026-09-11. | (N, office_id, HK) | Catalogue title certified is retained text, not a supplied certification proceeding or whole-event legal status. |
| record_state | H or supplied O next membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N, office_id, HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N, office_id, HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H original row +exact IX counterpart; next O row +Cal qualifier locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | No added histories from gap notes or historical HTML headings. |

## proceeding

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Bosnia and Herzegovina package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | D.Office ID under N | `N = cdd-observatory-v1` (stable identity space; not a release). | (N, office_id, HK, result_row_id) | Namespace must match event. |
| office_id | D.Office ID | Exact ID. | (N, office_id, HK, result_row_id) | FK same-country office. |
| history_key | D.Office ID/Year/Ballot date if recorded | Same HK rule as H; exact join, no year-only approximation. | (N, office_id, HK, result_row_id) | All 749 rows join39 H keys, never prospective rows or office-year approximation if dates later supplied. |
| result_row_id | Proposed per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N, result_row_id) | 749 unique vectors; physical/semantic baseline aliases guard refresh order changes. |
| proceeding_id | No supplied structured proceeding | NULL. | (N, result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Country +exact O.Office ID join | `bosnia-and-herzegovina`. | (N, result_row_id) | All D rows label Bosnia and Herzegovina; composite FK country/N/office. |
| candidate_or_list_label | D.Candidate or list then D.Party or proposer | First exact nonempty source label, elseNULL. | (N, result_row_id) | No invented labels; original spelling/case retained. |
| original_party_label | D.Party or proposer | Exact token orNULL; no family equivalence. | (N, result_row_id) | No Independent default or coalition expansion. |
| original_party_code | D.Party or proposer, combined label/code convention | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N, result_row_id) | Preserved source token, not new standardized party identity. |
| party_namespace | D.Year + country package source scope | `bosnia-and-herzegovina/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N, result_row_id) | Source election-cycle year namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N, result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes or marks | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N, result_row_id) | 749 positive nonnegative integers; no missing/zero baseline votes. No marks/voter reinterpretation beyond stated basis. |
| votes_status | D.Votes or marks null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N, result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share on stated basis | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N, result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share on stated basis null/number | NULL→unknown; 0→zero; positive→recorded. | (N, result_row_id) | 749 positive 0..100 values; never recalculate from partial series or split Others. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N, result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N, result_row_id) | 293 positive, 369 zero, 87 NULL. Missing does not become0/not_applicable; no elected flag inferred. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N, result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N, result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N, result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D.Result coverage and supplied observations | recorded for 749 baseline rows; qualifiers retainedraw. | (N, result_row_id) | Recorded does not mean exhaustive party decomposition, certified event or current control. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | S row or actual inline occurrence | `bosnia-and-herzegovina`. | (bosnia-and-herzegovina, source_namespace, source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-bosnia-and-herzegovina`. | (bosnia-and-herzegovina, source_namespace, source_id) | Separate from office namespace; stable across releases. |
| source_id | S.Source ID plus actual inline-only URL | Catalogue `bosnia-and-herzegovina--` + Source ID; inline-only `bosnia-and-herzegovina--` + key("url", exact URL). | Source tuple | 28 distinct catalogue rows +2 inline-only URLs=30 sources. |
| publisher | No dedicated publisher column; inline lacks metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | S.Title | Verbatim for catalogue; NULL inline-only. | Source tuple | No publisher/title fabrication; catalogue metadata preserved without implying fresh verification. |
| url | S.Source URL or real inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | All catalogue URLs unique; preserve query/resId/langId and hash fragment exactly. |
| checked_as_of_label | S.Accessed | Exact catalogue value; inlineNULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | S.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | S original row or actual inline occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L, input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | bosnia-and-herzegovina except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party_mapping target; result party labels remain election-scoped source context. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-bosnia-and-herzegovina for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L, R, input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator) defined in Source notation; includes member archive_entry, exact source_rows[i], pointer and SHA. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key, source tuple, occurrence identity, claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | bosnia-and-herzegovina. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-bosnia-and-herzegovina. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H/IX event/date; D result; Cal+O office calendar_context and next event/date; Nts country calendar_context; BF artifact_reference. | evidence_id | No poll/control observations supplied; classification provenance uses retained T FK without fake source row. |
| date_claim_id | Historical H ballot owner or O upcoming date supported by exact occurrence | Actual date_id only when claim_kind=date; otherwise NULL. | evidence_id | Only date claim references actual date row; next includes O date and Cal expected qualifier separately. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key, occurrence identity, original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind, upstream_namespace, upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | preserved_package_id, proposed_bridge_compatible_id, package_source_id, exact_url_catalogue_alias, baseline_row_binding, documented_identity_correction. | Crosswalk PK | No claim that proposed Bosnia and Herzegovina events are already-public aliases; future correction needs retained override. |
| lineage_id | Owning package M / staged lineage | `L = country-package-bosnia-and-herzegovina`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Bosnia and Herzegovina row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination column | Source locator / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
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
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id, release_id} succeeded. | attempt_id | Entire set, not only Bosnia and Herzegovina. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## Entity and canton distinctions

Classification depends on **register jurisdiction plus institution**, corroborated by country notes identifying entity/cantonal offices. The word National in National Assembly and President alone are not Bosnia-wide national-tier evidence. T is the only classifier; Cal. Tier=Regional / municipal is explicitly excluded.

| ID | Source jurisdiction | Source office | Scope | Proposed tier | Register pointer |
| --- | --- | --- | --- | --- | --- |
| BA-205 | Bosnian-Podrinje Goražde | Cantonal assembly | canton | regional | /rows/0 |
| BA-210 | Canton 10 | Cantonal assembly | canton | regional | /rows/1 |
| BA-206 | Central Bosnia | Cantonal assembly | canton | regional | /rows/2 |
| BA-F | Federation of Bosnia and Herzegovina | House of Representatives | entity | regional | /rows/3 |
| BA-207 | Herzegovina-Neretva | Cantonal assembly | canton | regional | /rows/4 |
| BA-202 | Posavina | Cantonal assembly | canton | regional | /rows/5 |
| BA-R | Republika Srpska | National Assembly | entity | regional | /rows/6 |
| BA-G | Republika Srpska | President | entity | regional | /rows/7 |
| BA-209 | Sarajevo | Cantonal assembly | canton | regional | /rows/8 |
| BA-203 | Tuzla | Cantonal assembly | canton | regional | /rows/9 |
| BA-201 | Una-Sana | Cantonal assembly | canton | regional | /rows/10 |
| BA-208 | West Herzegovina | Cantonal assembly | canton | regional | /rows/11 |
| BA-204 | Zenica-Doboj | Cantonal assembly | canton | regional | /rows/12 |

Country remains one sovereign-country row. Entity/canton scope survives in T and office/geography raw metadata. No explicit parent-geography relationships or boundary dates are supplied; parents remainNULL. BA-R and BA-G bind two office-type-specific RS geography IDs, not two invented entities. No Federation/RS country rows, Brčko placeholder, municipal conversion or additional presidency/mayor are created.

## History overlap, detail binding and date policy

H and IX have identical39 full office/year/ballot-key sets. H numeric/null cells and IX CSV numeric strings/empty cells normalize identically for shared comparison; IDs/text/URLs must be exact. Use H as typed source, retain IX as reconciliation provenance. Any future duplicate or contradictory identity/value after explicit scalar normalization fails for review; no last-wins. D groups by complete HK; all 749 match39 H events. Do not join by office/year if nonempty ballot labels later distinguish events. H leader/runner and BF tables never add duplicate D rows.

Historical HK retains raw null date as empty string. Use H.Year for year precision only; do not infer a day from the cycle calendar, source URL or source-title certified wording. All 2014/2018/2022 historical dates have certainty=unknown. No structured event kind or formal legal outcome is supplied; both remain unknown. No certification/repeat proceeding record is created from narrative. Result rows keep their exact source coverage and denominator notes.

All 13 O.Next polling date cells independently supply2026-10-04. Map one prospective event per supplied office, key(next, office_id), and reuse its date_id in office.next_date_id. Attach O date locator plus Cal /rows/0/4 for matching day,/rows/0/6 for qualifier and /rows/0/10 for CEC homepage citation. This is an explicit **date-context mapping**, not tier classification or fresh legal verification. O.Calendar evidence isNULL for all 13; do not fabricate catalogue metadata or a called date. BA-G replacement/repeat gap remains open despite its supplied expected regular-cycle date. Upcoming legal_outcome=not_held is as of research snapshot2026-09-11, not a live status claim.

Future YYYY-MM labels retain month precision/dayNULL; year labels keep month/dayNULL. Unknown event dates require an explicit unknown research_date because DDL requires nonnull date_id for unknown/resolved events. Unknown office next dates need no fabricated event. Independent conflicting claims remain separate date/evidence rows; event selected date pointerNULL, resolution=conflicting; office selected pointer and next_history_key alsoNULL. Actual ranges require sourced ordered noncyclic endpoints; no day1 padding. Snapshot/package/window dates never substitute for polling dates.

## Evidence and sources

S has 28 distinct catalogue IDs and URLs. Two real inline-only URLs are CEC homepage and the retained2027 screening URL, giving30 canonical sources. H/D use Source URL only; there is **no Source ID column** there. Match exact unique URL to S. Preserve resId/langId/query/hash-fragment bytes; no catalogue-ID or URL rewriting. File/table SHA is not a hash of a remote result page; source.file_sha256 remainsNULL. Inline sources have missing title/publisher/access/gradeNULL, not fabricated metadata. No remote election page was freshly verified here.

| Occurrence | Real target / claim | Binding |
| --- | --- | --- |
| H.Source URL and matched IX.Source URL | event/date | Canonical source by exact URL; both original occurrences retained |
| D.Source URL | result_row | Exact URL and full event/result FK |
| O.Next polling date +Cal date/status/URL | office calendar_context, next event/date | Same day match; expected qualifier explicitly retained; all 13 office-specific dates supplied |
| Cal. Source URL | retained Cal input calendar_context | Cohort context retained independently; no tier derivation |
| Nts. Screen evidence / coverage.screen_source | country calendar_context | Real inline screening source; not a poll |
| BF/country HTML external href | retained artifact artifact_reference | Exact inert anchor occurrence; local navigation stays raw |
| T/register evidence | classification retained-input FK and raw locators | No fake catalogue source for a register row |

Known citation omitted from staging is fatal broken source FK. An actual unknown/malformed/ambiguous citation token becomes unresolved_evidence with exact token, reason, occurrence and existing target record_locator; no fabricated publisher/source ID. Genuine unmatched HTTP URL may create inline source under deterministic URL identity. Blank fields, local links, workbook names and party labels are not unresolved evidence. Future token and URL conflict must fail review; source keys cannot be invented to make constraints pass.

## Open research reviews and exclusions

BA-G retains three supplied regular-cycle histories and one expected2026 next event. The country note explicitly leaves RS replacement/repeat presidential events unreconciled; it supplies no additional identity/date/vote/sequence. No missing event is fabricated, no regular history withdrawn and no current president inferred. The issue belongs to BA-G; BA-R is the distinct legislature and cannot substitute. Coalition-history review applies to all supplied institutions; largest party is not automatically governing control. No Governing control or Polling evidence table exists. Summary count0 means no supplied observations, not observed zero control/polling.

Ten 2014 canton histories retain published Others aggregates and their unknown within-Others composition. Do not assign them to invented parties or infer comparability from three entries. Score gates, competition scores, volatility proxies, polling-watch strings and formula caches remain retained raw; no metrics calculated. coverage.status/remaining explicitly preserve gaps; derive research_coverage_complete=0 and country.coverage_status=partial without pretending M has a coverage_complete boolean. Website ingestion remains pending.

## Publication protocol (future implementation)

Persist started attempt in separate durable ledger before staging. Use consistent SQLite backup of last good master into same-filesystem staging, preserving all unrelated lineage releases/rows/citations. Check tier approval, effective input hashes, semantic refs, fixture exclusion andSQL integrity before committing release. Keep prior good on-VPS/off-VPS backups. Checkpoint WAL TRUNCATE with no busy/uncheckpointed frames, close handles, fsync staging, atomic rename, fsync parent; safely reopen readers without stale WAL/SHM. Staged full publication_release set and receipt permit crash recovery. Finish ledger success only after verified swap; failure leaves last good publication serving and durable failed attempt.

Unchanged effective inputs→new attempt, sameR. Corrections with accepted exact guards/evidence change release while preserving identity. Incomplete refresh is not deletion:retain omitted rows and original bytes with inherited hash-addressed input paths in effective fingerprint. No unrelated lineage or Mexico change. Draft T blocks production; schema can represent needs_review for review staging without approval. Importer/SQL/publication/VPS/UI execution is Not run.

## Complete source-column disposition

All columns below remain lossless in retained table JSON and row raw envelopes when projected. Unknown future columns default raw retention and semantic review, not inventedSQL columns.

### tables/master/country-coverage.json

1 rows; sheet `Country coverage`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Country or territory | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 1 | Office records | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 2 | Historical entries | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 3 | Three entries | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 4 | Competition scores | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 5 | Grouped volatility scores | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 6 | Sourced current control | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 7 | Calendar cohorts | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |

### tables/master/country-notes.json

1 rows; sheet `Country notes`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Country or territory | country identity assertion |
| 1 | Scope and remaining gaps | country.notes+raw; T research-review context |
| 2 | Election calendar | country.raw_json; not a new event |
| 3 | Detailed workbook | original archive recovery metadata |
| 4 | Screen evidence | country calendar_context evidence |

### tables/master/detailed-returns.json

749 rows; sheet `Detailed returns`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Office ID | result office/event FK |
| 1 | Country | country assertion |
| 2 | Jurisdiction | O assertion; raw |
| 3 | Year | HK+party_namespace |
| 4 | Ballot date if recorded | exact original HK; allNULL |
| 5 | Electoral unit | semantic binding+raw; allNULL |
| 6 | Candidate or list | candidate_or_list_label; semantic binding |
| 7 | Party or proposer | original_party_label/code; display fallback; semantic binding |
| 8 | Votes or marks | votes/votes_status |
| 9 | Share on stated basis | share/share_status percent_0_100 |
| 10 | Seats | seats/seats_status missing≠zero |
| 11 | Result coverage | result raw limitations; no invented certification |
| 12 | Vote basis | crosscheck event denominator convention |
| 13 | Source URL | result source/evidence |

### tables/master/election-calendar.json

1 rows; sheet `Election calendar`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Cohort ID | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 1 | Country | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 2 | Election cohort | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 3 | Tier | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 4 | First or scheduled date | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 5 | End or runoff date | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 6 | Date status | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 7 | Historical cycles | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 8 | Coverage and timing | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 9 | Prior-call units if known | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |
| 10 | Source URL | retained Cal input; date/status/URL also support explicit O next-date expected qualifier; Tier never classifies. |

### tables/master/history-index.json

39 rows; sheet `History index`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Office ID | event office FK/HK |
| 1 | Country | country assertion |
| 2 | Jurisdiction | crosscheck O; raw |
| 3 | Ballot date if recorded | HK raw segment and date source; allNULL |
| 4 | Year | HK/year-precision research_date |
| 5 | Leading candidate or party | retained summary raw; leader/runner does not add result rows |
| 6 | Leader share | retained summary raw; leader/runner does not add result rows |
| 7 | Runner-up candidate or party | retained summary raw; leader/runner does not add result rows |
| 8 | Runner-up share | retained summary raw; leader/runner does not add result rows |
| 9 | Vote basis | ballot_basis |
| 10 | Coverage | comparability/raw |
| 11 | Comparability status | comparability/raw; score gate retained |
| 12 | Source URL | event/date resolved evidence |

### tables/master/office-register.json

13 rows; sheet `Office register`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Office ID | office.office_id; T join; crosswalk |
| 1 | Country | country FK assertion |
| 2 | Jurisdiction | geography.name/key; office.name; T evidence |
| 3 | Office | office_type/name; G key; T evidence |
| 4 | Next polling date | prospective event/date and office next pointer |
| 5 | History entries | H/IX per-office count assertion |
| 6 | Latest eligible gap pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 7 | Middle gap pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 8 | Oldest gap pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 9 | Weighted gap pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 10 | Competition score | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 11 | Historical competition screen | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 12 | Pedersen interval 1 pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 13 | Pedersen interval 2 pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 14 | Mean Pedersen pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 15 | Margin dispersion pp | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 16 | Volatility interpretation | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 17 | Polling and government watch | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 18 | Historical coverage | office.raw_json; next event.comparability |
| 19 | Detailed workbook | off-payload original workbook provenance |
| 20 | Calendar evidence | NULL baseline; future real citation resolver |

### tables/master/parameters.json

12 rows; sheet `Parameters`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Assumption | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 1 | Value | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 2 | Definition | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |

### tables/master/read-me.json

13 rows; sheet `Read me`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Topic | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |
| 1 | Use and interpretation | retained_input.payload_json; raw_json if attached. No metric/control or invented typed field. |

### tables/master/sources.json

28 rows; sheet `Sources`; pointer /rows/i/j; original source row source_rows[i].

| j | Exact column | Destination / policy |
| ---: | --- | --- |
| 0 | Source ID | source.source_id andaliases |
| 1 | Title | source.title |
| 2 | Source URL | source.url |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

### Other members and outer files

Standalone IX repeats all 13 H columns as CSV-derived strings; 39 keys reconcile, 0 additional events. Preserve original strings, including numeric-string shares and empty dates. source-links.json retains exact URL lists and its extraction note; formula-cache.json retains formula text/attributes/caches without evaluation. inventory.json retains original archive-entry checksums/bytes and other-member hashes.13 office HTML files plus country HTML retain exact inert bytes; no double counting of their historical/result tables. The original master XLSX remains off-payload in the shared Europe ZIP; both hashes were reverified. Shared Parameters/Read me are regional methodology, not extra country data. All 7 outer files are enumerated and retained. No companion, poll, control, geometry, party-concordance or proceeding collection is invented.
