# Austria → Atlas master field map

**Prompt N — documentation draft; no importer/SQLite/VPS/UI execution.** Package pin PR #11 `codex/europe-austria` at `6b38848d76a815f7dd0bcae3d49a25e6dca9e1af`. Current main contract pin `6e6426fe17f6f542b58b68f8607124e007b852ff`. Austria is absent from that main tree; this pack does not merge PR #11. Repository: FTFNAnalytics/digitaldemocracy. Pins were read through GitHub immutable trees; fetched/materialized bytes checked against git blob SHA. Shared archive was rehashed and the extractor reproduced all 19 chunks exactly, checked against manifest SHA-256 and PR blob SHA.

Governing contract: docs/atlas-plan.md, main migrations0001/0002, lib/atlas/identity.ts and scripts/import/normalize.ts, and main docs/phase1 Albania/Andorra/Alderney/Armenia maps. The plan's opening historical status paragraph predates the live early-Europe work; this pack does not revert it or reopen locked decisions. SQLite on VPS, /atlas, Europe-first and Russia exclusion remain fixed. No redirects or /electiondatabase retirement.

The tier file is **draft_for_human_review**, SHA `9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d`. Register SHA `19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68` (713630 bytes). Exact 2038 IDs: **2034 municipal (1017 mayors+1017 councils),4 regional**. Four regional rows have focused review flags; no other tier ambiguity found. Justin must approve the pack before production import. Zero approved Austria regional rows today; four proposed regional offices is not four dated upcoming elections. **All 2038 next-date cells and all cohort date cells are null.**

This map covers all 223 research/operational columns in the20 requested master/ledger tables, plus every column in15 payload tables. schema_migration remains migration-owned and is not a research destination. See [identities](Austria_Identity_Rules.md), [examples](Austria_Acceptance_Examples.md), [checklist](Prompt_N_Tiers_Field_Map_and_CI.md), [input inventory](Austria_Input_Inventory.json) and [complete ID vectors](Austria_Identity_Vectors.json). Vectors are proposed deterministic outputs, not existing public Austria IDs or a published release.

**Additional publication hold:** `AT-OOE-41119-M::2015::` has conflicting first-ballot/final-ballot representations. Both remain preserved; the named stage-binding issue requires an accepted resolution. See the reconciliation section and Example 17.

## Baseline

| Recomputed count | Value |
| --- | ---: |
| current_offices | 2038 |
| municipal_offices_proposed | 2034 |
| regional_offices_proposed | 4 |
| approved_austria_classifications | 0 |
| focused_tier_reviews | 4 |
| geographies | 2038 |
| mayor_offices | 1017 |
| municipal_council_offices | 1017 |
| companion_offices | 2034 |
| companion_histories | 5944 |
| index_histories | 5956 |
| overlap_histories | 5944 |
| index_only_histories | 12 |
| total_events | 5956 |
| prospective_events | 0 |
| unknown_next_dates | 2038 |
| historical_dates_day | 58 |
| historical_dates_year | 5898 |
| calendar_cohorts | 8 |
| calendar_nonnull_dates | 0 |
| result_rows | 16336 |
| master_catalogue_rows | 71 |
| companion_catalogue_rows | 86 |
| overlapping_catalogue_ids | 64 |
| distinct_catalogue_sources | 93 |
| inline_only_sources | 4 |
| sources | 97 |
| office_briefings | 2038 |
| country_briefings | 1 |
| poll_records_retained | 1 |
| control_observations_supplied | 0 |
| proceedings | 0 |
| party_mappings | 0 |
| outer_package_files | 25 |
| payload_member_files | 2058 |
| retained_inputs | 2084 |

H 5944 overlaps IX 5956 by5944 exact keys; **5956 distinct histories**, not11900. The four offices outside J/H/D contribute12 index-only events and no new structured result rows. D 16336 rows all join H. H selects11 incomplete/first-ballot records with Actual election return=false;12 rows have Competition eligible=false. Selection is a research-history membership, not permission to compute metrics or claim complete decisive returns. All source flags survive.

D values: votes16336 positive; shares16336 positive; seats8756 positive/400 zero/7180 missing. Missing seats are not zero/not_applicable by office type. coverage.current_control_records="0" is an inventory count, not an observation of zero control; no control collection is supplied. One Lower Austria regional polling observation is retained verbatim; no national-to-local forecasting, metric or poll table is added. Research coverage stays partial and website_ingestion=pending stays original package metadata.

## Source notation and recovery

P=`data/countries/austria/`. V=P+`unpacked/` is a **virtual retained-input member prefix**, not a checked-in directory. Recover entries by concatenating part001…part019 in manifest insertion order, checking each byte length/SHA, checking concatenated payload SHA, XZ-decompressing, then safely reading tar. Reject links, duplicate/unlisted paths, traversal, absolute names and length/hash mismatch. Match inventory.json hash/length from M, and all 2057 other members against its contents list. The validator was executed for package-only integrity; no importer ran.

| Alias | Exact path |
| --- | --- |
| M / coverage | P+manifest.json / coverage.json |
| O | V+tables/master/office-register.json |
| J | V+tables/companion/jurisdictions.json |
| H | V+tables/companion/histories.json |
| IX | V+history-index.json |
| D | V+tables/companion/full-results.json |
| SM / SC | V+tables/master/sources.json / tables/companion/sources.json |
| Cal / Nts | V+tables/master/election-calendar.json / tables/master/country-notes.json |
| Poll | V+tables/master/polling-evidence.json |
| BF | V+Office_Briefings/Offices/{exact office_id}.html |
| T | schemas/atlas/tiers/austria.json |

Table column pointer `/rows/i/j`, j=columns.indexOf(exact header), original worksheet row=source_rows[i], sheet=table.sheet. IX `/i/key` uses RFC6901 escaping. Never assume sheet row=i+2. Locator `{input_path,archive_entry,sha256,json_pointer,sheet,source_row,column,html_anchor_index}` uses null for inapplicable fields. Root pointer is empty string. HTML external anchors use zero-based external-http(s)-anchor document order. Retain inert bytes, never run scripts or formulas.

Raw envelope `{origin:locator,row:original_object,columns:columns_or_null,values:row_array_or_null,supplemental:items_with_own_locators}`. Keep numeric precision, nulls, unknown fields and row order. Existing raw_json/retained_input.payload_json carry extensions; no new SQL columns. Every input JSON retained whole. HTML/chunks/scripts/other non-JSON retained by content hash with payload_json=NULL. Original XLSX bytes are **not payload members**; source inventory names/hashes/lengths and verified shared ZIP provide recovery. Do not fabricate an XLSX member or treat its repeated basename as a source URL. Both original workbooks were rehashed from shared archive; they remain provenance metadata, outside this version's2084 effective input descriptors.

Common conversion: source null→SQL NULL except required status unknown; optional blank scalar→NULL with raw preserved. Identity strings never trim/change case/Unicode. Invalid identity, type, nonfinite/domain value, duplicate key/header or resolved FK fails closed. L=country-package-austria; N=cdd-observatory-v1; R=effective fingerprint release. Empty proceeding/party_mapping means no row for every column. Standard lineage/release ownership applies only to rows actually emitted.

## dataset_lineage

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | M.country + proposed country-package identity | Fixed `country-package-austria`; never a per-run ID. | L; PK | One Austria source-dataset lineage; no existing Austria public release claimed. |
| provenance_kind | M + inventory/README package contract | country_package; frozen chunked Austria extract at PR #11. M contains no schema_version field. | L | Reject fixture/unknown provenance; verify packed payload before reading rows. |
| description | M.country | `Austria frozen country package`; operational description. | L | Does not claim completeness. |

## dataset_release

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| fingerprint_sha256 | All 25 P files +2058 V members +T + applicable overrides +versions | SHA-256 of canonical UTF-8 hash-input JSON, per Identity Rules § Fingerprint. | R | Recompute; lowercase 64 hex; unchanged inputs same digest. |
| hash_inputs_json | Effective inventory, including inherited inputs | Canonical object exactly defined in Identity Rules; overrides=[] initially. | R | No attempt/time/absolute locator or unrelated lineage inputs; no duplicate path. |
| adapter_version | Mapping contract | `atlas-austria-field-map/1`; increment on semantic mapping changes. | R | Equals hash_inputs_json.adapter_version. |
| method_version | Identity/evidence contract | `atlas-preserve-evidence/1`. | R | Equals hash_inputs_json.method_version. |
| schema_version | Prompt B migrations | `atlas-master/1`; DDL byte hashes also included in hash inputs. | R | Equals hash_inputs_json.schema_version; schema user_version=1. |
| research_snapshot_label | M.research_snapshot | Copy `2026-09-11`; no packaged-on fallback pretending research date. | R | Copy 2026-09-11; do not substitute M.packaged or attempt timestamp. |
| upstream_release_id | Proposed package alias | country-package-austria; stable planned alias, not a claim of an already-public Austria bridge release. | R | Keep separate from new content-derived R. |
| validated_counts_json | Recomputed O/J/H/IX/D/SM/SC/Cal inventories | Object with names in § Baseline; integers from actual inputs, not copied unchecked. | R | 2038 offices,5956 distinct histories,16336 results,97 sources; no prospective event baseline. Inventory contains all counts. |
| research_coverage_complete | coverage.status/remaining and Nts.Scope and remaining gaps | 0, from explicit remaining coverage gaps; M has no coverage_complete boolean. | R | No invented coverage_complete source property; coverage remains partial. |
| raw_json | M entire object; coverage.json entire object | Raw envelope with both unchanged JSON objects and byte hashes. | R | Preserve M.website_ingestion=pending and original coverage gaps; documentation is not live publication status. |

## retained_input

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| input_path | 25 tracked P files +2058 unpacked members +draft T | P paths for outer files; V= P+unpacked/ followed by exact tar member path for members; T unchanged logical path. Inherited paths per Identity Rules. | (L,R,input_path) | 2084 distinct candidate descriptors; draft approval gate prevents publication. V is virtual, not git-tracked. |
| input_kind | Path class | T=tier_classification; HTML/XLSX/payload chunks=artifact; other outer/member files=package; accepted future overrides=override. | (L,R,input_path) | No content discarded because not projected. |
| sha256 | Original file bytes | SHA-256, lowercase hex; never hash reserialized JSON. | (L,R,input_path) | Verify 19 ordered chunk hashes/lengths, concatenated XZ payload, inventory and every member. |
| byte_count | Original file bytes | Exact byte length, nonnegative integer. | (L,R,input_path) | Compare manifest bytes where supplied. |
| recovery_locator | Verified immutable input store + original repo commit/path | sha256:<sha256> immutable content store; virtual member also records payload hash, exact archive_entry and pinned outer chunks in inventory. | (L,R,input_path) | All bytes recoverable and rehashed before publication; no dependency on temporary unpack directory. |
| payload_json | Entire JSON file, including rows/columns/source_rows; T; overrides | For *.json: original UTF-8 JSON text after validity check; otherwise NULL. Never evaluate formulas/scripts/HTML. | (L,R,input_path) | Retain all JSON including one poll, scores/controls summary, formulas and unknown fields. No new metric/poll/control table. |

## country

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | M.country + declared package slug | Literal austria. | country_id | No new country from shared Read me text. |
| country_code | extract.py CODE constant | AT; provenance source is frozen extract.py CODE="AT", not inferred from AU office prefixes. | country_id | Do not rename AU-prefixed offices or treat them as Australia. |
| name | M.country | Copy `Austria`. | country_id | Nonempty. |
| polity_kind | Country Austria in M and accepted Europe plan | sovereign_country. | country_id | No new country or territorial parent from other-country regional methodology. |
| region_id | Accepted Europe package/plan | europe. | country_id | Geographic landing region, not office tier. |
| coverage_status | coverage.status/remaining + Nts.Scope and remaining gaps | partial. | country_id | Explicit remaining gaps, not a nonexistent M.coverage_complete field. |
| screening_as_of_label | No separate Austria screening-as-of field | NULL; no separately supplied screening-as-of date. | country_id | NULL; M.research_snapshot belongs to dataset_release. |
| notes | Nts.rows[0][Scope and remaining gaps] | Verbatim; no fallback rewrite in baseline. | country_id | Preserve Carinthia 2009, replacement returns, Krems/Waidhofen, Graz and current-control gaps verbatim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | M + coverage.json + Nts row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## geography

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | O.Country + M.country | `austria`, after exact country-label check. | (country_id,geography_id) | FK country; never cross-country. |
| geography_id | O.Jurisdiction +O.Office +proposed bridge-compatible key | G=key("geo",["austria",Jurisdiction,Office]); frozen bindings retained thereafter. | (country_id,G) | 2038 distinct G values verified. No place/type collisions; freeze ID binding thereafter. |
| name | O.Jurisdiction | Verbatim (all supplied); reject empty baseline. | (country_id,G) | No synthetic municipality spelling. |
| parent_geography_id | Not supplied | NULL. | (country_id,G) | No parent geography supplied; NULL. No province/geometry fabrication. |
| effective_from_label | Not supplied | NULL. | (country_id,G) | No reform dates invented. |
| effective_to_label | Not supplied | NULL. | (country_id,G) | No implicit expiry. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O row for this G | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Identity contract | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,O.Office ID) | No release hash in namespace. |
| office_id | O.Office ID | Exact string, no trim/case/diacritic normalization. | (N,office_id) | Exact 2038 O IDs including four AU/AT regional IDs; no mayor invented. T exact set equality. |
| country_id | O.Country + M.country | `austria`; exact Austria label required. | (N,office_id) | FK country via same-country geography. |
| geography_id | O.Jurisdiction + O.Office | Use G bound to this Office ID. | (N,office_id) | Same-country FK to one of 2038 G values; no geographic parent hierarchy inferred. |
| name | O.Jurisdiction + O.Office | Exact concatenation `Jurisdiction + " — " + Office`. | (N,office_id) | Both inputs retained raw. |
| office_type | O.Office | Exact O.Office: Mayor, Municipal council, State legislature, Regional legislature. | (N,office_id) | Office type separate from geographic tier;1017 existing mayors and 1017 councils retained. |
| office_status | O membership in current register | `current`; baseline only. | (N,office_id) | Describes office, not present holder tenure. |
| record_state | O membership; explicit later override if any | `active`; omission cannot withdraw. | (N,office_id) | Nonactive requires sourced state_note and retained override. |
| state_note | No withdrawal/supersession supplied | NULL. | (N,office_id) | Never populate merely because incomplete refresh omits a row. |
| registry_qualified | No registry qualification assertion | NULL; competition screen is not qualification. | (N,office_id) | Unknown ≠ false. |
| next_date_id | O.Next polling date; J.Next date where supplied | NULL for all 2038 baseline offices. | (N,office_id) | No date or next event from Cal Date status, term expiry or expected-cycle prose. |
| next_date_resolution | Same date inputs | unknown for all 2038 baseline offices. | (N,office_id) | Future supplied precise or partial dates resolve only as labelled; competing claims→conflicting, selected pointer NULL. |
| next_history_key | No nonnull O.Next polling date baseline | NULL baseline; future explicit office next date uses key("next",office_id). | (N,office_id) | No prospective baseline event. Preserve prior binding on incomplete refresh. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | O original row plus matching J row and BF artifact locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## office_tier_classification

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | T.classifications[].office_id | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id) | Same namespace as office. |
| office_id | T.classifications[].office_id | Exact ID; join O.Office ID. | (N,office_id) | Set equality, no missing/extra/duplicate IDs. |
| tier | T.classifications[].tier | T regional→regional (4); municipal→municipal (2034); national→national_context if later approved. | (N,office_id) | Only T drives tier. Legacy council metadata is not a DDL tier; no row emits it. Unknown/hold must not become other. |
| review_status | T.status + row.tier / human_review_required / tier_uncertain | needs_review for every baseline row because T.status=draft_for_human_review. Future accepted status +clear row flags→approved; explicit hold/null tier→unknown. | (N,office_id) | No publication with this draft. Four regional rows have focused human_review_required=true; other 2034 still need pack approval. |
| rationale | T.classifications[].rationale | Verbatim, nonempty. | (N,office_id) | Must cite office/geography evidence, never calendar cohort alone. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| classification_path | T logical path | `schemas/atlas/tiers/austria.json`. | (N,office_id) | Deliverable draft only, not claimed committed or approved. |
| classification_kind | Mapping contract | `tier_classification`. | (N,office_id) | Composite FK to retained_input kind/hash. |
| classification_sha256 | Exact T bytes | 9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d | (N,office_id) | Matches candidate retained descriptor. Justin approval changes bytes and requires a new fingerprint. |
| raw_json | T.classifications[] original object | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## research_date

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| date_id | H or IX-only event owner | date-+SHA(C([N,"event",event_id,"ballot"])). | date_id | 5956 date owners; no office-next date rows. |
| label | H.Round / basis exact allowlist; otherwise H.Year; IX-only Year | 58 exact named-date substrings;5898 four-digit Year labels. Complete date cells are absent; no implicit day. | date_id | Allowlist in inventory and Date policy below; cycle year remains identity even if ballot year differs. |
| precision | Full-string date grammar | day for 58 explicit annotation dates; year for 5898 baseline remaining histories. | date_id | Future YYYY-MM remains month, never day1. Unknown and ranges need explicit source grammar. |
| certainty | No separate historical date-certainty field | unknown for all 5956. | date_id | Day precision does not certify date; source grade and original text retained. |
| year | Named-date allowlist ballot year or explicit Year fallback | Integer 1..9999; NULL if unknown or range. | date_id | Three repeat histories have ballot year later than cycle Year. HK keeps source cycle Year; no contradiction coercion. |
| month | Parsed month component | 1..12 for day/month; otherwise NULL. | date_id | Year precision cannot gain a month. |
| day | Parsed day component | Actual Gregorian day for day precision only; otherwise NULL. | date_id | Leap/month-length validation. |
| range_start_id | Explicit paired endpoints only; absent baseline | NULL baseline; future actual ranges use slot+/start. | date_id | Calendar cohort first/end are not a per-office range. |
| range_end_id | Explicit paired endpoints only; absent baseline | NULL baseline; future actual ranges use slot+/end. | date_id | No cohort timing converted to office range. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row + IX counterpart or IX-only row; exact date-source locator | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Keep null actual-ballot cells, source Year, cycle key and annotation together. |

## election_event

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | H or IX-only office identity | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,history_key) | Same as office. |
| office_id | H.Jurisdiction ID or IX.Office ID | Copy exact. | (N,office_id,history_key) | Full FK (N,office_id), all source IDs in O. |
| history_key | H ID/Year/Actual ballot date or IX ID/Year/Ballot date | HK exact source tuple; all baseline date-key segments empty. | (N,office_id,HK) | 5944 H keys equal companion-covered IX subset;12 IX-only keys added exactly once. |
| event_id | Proposed deterministic bridge-compatible identity | key("event",["austria",HK]). | (N,event_id) | 5956 distinct proposed IDs, not already-public Austria IDs; no release/attempt in key. |
| date_id | H or IX-only date projection | Own ballot date ID, including unknown-date row if label absent. | (N,office_id,HK) | 5956 real date rows; resolved/unknown requires nonnull date_id by DDL. Conflict requires NULL selected pointer. |
| date_resolution | Parsed historical or prospective date + documented conflicts | resolved for 5956 baseline dates at recorded precision; future missing label/year→unknown with explicit unknown research_date; conflict→conflicting. | (N,office_id,HK) | Resolved year is not an exact day. |
| event_kind | H.Round / basis; IX-only has no kind | Exact repeat prefixes in Date policy→repeated (3); Ordinary / Early ordinary-cycle prefixes→ordinary; all others→unknown. | (N,office_id,HK) | No extra proceeding or annulled predecessor fabricated; see exact mapping and vector counts. |
| selected_history_role | Selected H / IX register histories | selected for 5956 histories; no next events. | (N,office_id,HK) | Selected research history is not completeness/score eligibility.11 H Actual election return=false and 12 Competition eligible=false retained and exposed as limitations. |
| electoral_system | No dedicated historical system field | NULL; no separate explicit system field supplied. | (N,office_id,HK) | Do not infer from office name, vote basis or current council structure. |
| comparability | H.Coverage + IX.Comparability status, or IX.Coverage + status | Nonempty strings joined using literal space·space; exact values also raw. | (N,office_id,HK) | Keep H Actual election return/Competition eligible raw; selected status cannot remove those gates. |
| ballot_basis | H.Round / basis, D.Vote basis, IX-only Vote basis | Valid council-list votes→list_votes; Valid candidate/list votes, Valid mayoral candidate votes, Valid votes→valid_votes; else unknown. | (N,office_id,HK) | Exact phrases only. Sole-candidate yes/no denominator notes remain raw; do not recompute percentages. |
| share_unit | H/D/IX share conventions | percent_0_100 without rescaling. | (N,office_id,HK) | Values copied, not multiplied/divided/rounded. |
| legal_outcome | No uniform structured event certification field | unknown baseline; textual official/certified-seat/annulment context retained raw. | (N,office_id,HK) | Do not mark repeat event annulled because its predecessor was annulled; do not infer certification from a seat-allocation description. |
| record_state | H / IX-only selected membership | `active` initially; only documented explicit withdrawal/supersession changes it. | (N,office_id,HK) | Missing row not deletion. |
| state_note | No event withdrawal instruction in selected H | NULL baseline. | (N,office_id,HK) | Nonactive needs sourced nonempty note. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | H row +matched IX row; IX-only original object; own locators | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | All unknown and conflicting narrative qualifiers survive; no extra event from HTML or summary leaders. |

## proceeding

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| office_id | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| history_key | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| proceeding_id | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| kind | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| sequence_no | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| supersedes_id | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| legal_outcome | No structured proceeding collection / IDs in frozen Austria package | NO ROW. Do not fill required columns with a dummy. If later explicitly supplied, retain the original ID, event, kind and source; sequence NULL unless supplied. | No baseline proceeding identity | 0 rows; result.proceeding_id NULL. Narrative replacement/certification is retained evidence, not a proceeding record. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## result_row

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | D.Jurisdiction ID | `N = cdd-observatory-v1` (stable identity space; not a release). | (N,office_id,HK,result_row_id) | Namespace must match event. |
| office_id | D.Jurisdiction ID | Exact ID. | (N,office_id,HK,result_row_id) | FK same-country office. |
| history_key | D.Jurisdiction ID/Year/Actual ballot date, if recorded | Same HK rule as H; exact join, no year-only approximation. | (N,office_id,HK,result_row_id) | 16336 D rows resolve to5944 H events; no D for 12 IX-only events. |
| result_row_id | Proposed per-event detailed-return order | `${event_id}-r${i}`; i zero-based within exact HK group in single D /rows encounter order; freeze baseline binding. | (N,result_row_id) | 16336 unique vectors; frozen physical and semantic aliases prevent later row-order identity drift. |
| proceeding_id | No supplied structured proceeding | NULL. | (N,result_row_id) | Do not synthesize first_round or certification. |
| country_id | D.Jurisdiction ID joined to O.Country; no Country column in D | `austria`. | (N,result_row_id) | Composite FK enforces office country. |
| candidate_or_list_label | D.Candidate / ticket then D.Party / list | First supplied nonempty exact string, else NULL. | (N,result_row_id) | 5295 candidate cells supplied;11041 null fall back to supplied party/list. No invented labels. |
| original_party_label | D.Party / list | Exact string or NULL; no coalition expansion. | (N,result_row_id) | No Independent default or coalition expansion. |
| original_party_code | D.Party / list, bridge-compatible combined label/code convention | Same exact original token to preserve bridge code semantics; raw notes combined label/code field. | (N,result_row_id) | Not a standardized party-family ID; original retained. |
| party_namespace | D.Year + country package source scope | `austria/` + bridge cellYear(Year), baseline 4-digit year; unknown if missing. | (N,result_row_id) | Source election-cycle year namespace retained; no cross-year successor equivalence. |
| party_mapping_id | No supplied sourced concordance | NULL. | (N,result_row_id) | No fabricated party_mapping rows. |
| votes | D.Votes | Finite nonnegative integer only; NULL if source null. Numeric strings/type errors fail pending documented conversion. | (N,result_row_id) | 16336 positive integers; no baseline null/zero votes. Never synthesize missing-vector rows. |
| votes_status | D.Votes null/number | NULL→unknown; 0→zero; positive→recorded. Preliminary/disputed source state lives independently in evidence_status. | (N,result_row_id) | No missing/zero collapse; no extra rounding. |
| share | D.Share | Finite numeric value copied as SQLite REAL, no display rounding. NULL remains NULL. | (N,result_row_id) | 0..100; round-trip numeric equality at binary64 precision. |
| share_status | D.Share null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | 16336 positive shares, all 0..100; no baseline null/zero shares. No recomputation. |
| share_unit | Same source share convention as event | `percent_0_100`. | (N,result_row_id) | Equals event share_unit. |
| seats | D.Seats | Nonnegative integer or NULL, exactly supplied. | (N,result_row_id) | 8756 positive,400 zero,7180 NULL. No elected_flag inference. |
| seats_status | D.Seats null/number | NULL→unknown; 0→zero; positive→recorded. | (N,result_row_id) | Missing seat never false/0/not_applicable by office-type guess. |
| elected_flag | Not supplied as boolean in D | NULL. | (N,result_row_id) | Do not infer from seat or highest votes. |
| is_substitute | Not supplied | NULL. | (N,result_row_id) | Do not copy bridge fabricated false. |
| evidence_status | D observed fields +H limitations | recorded for all 16336 supplied numeric records; completeness/actual-return qualifiers remain in event comparability/raw. | (N,result_row_id) | Recorded observation does not imply certified, current-control or complete final return. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | D original row | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## party_mapping

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
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
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | No baseline source collection | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## source

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | SM/SC rows or actual inline occurrence | `austria`. | (austria,source_namespace,source_id) | FK country. |
| source_namespace | Source identity contract | `country-package-austria`. | (austria,source_namespace,source_id) | Separate from office namespace; stable across releases. |
| source_id | Union SM/SC Source ID + actual inline URL | Catalogue `austria--` + Source ID; inline-only `austria--` + key("url",exact URL). | Source tuple | 71 SM+86 SC−64 equal-ID duplicates=93 catalogue sources;4 genuine inline-only URLs=97. |
| publisher | No dedicated publisher column; inline lacks metadata | NULL. | Source tuple | Evidence grade, host name and country label are not publisher. |
| title | SM.Title or SC.Title / dataset | Verbatim; duplicate source rows agree after header normalization; inline-only NULL. | Source tuple | Conflicting future same-ID metadata fails review; no invented publisher/title. |
| url | SM.Source URL or SC.URL; genuine inline URL | Exact string, no rewriting/URL normalization. Require http/https URL. | Source tuple | Exact unique catalogue URL match; no fetching or claiming current availability. |
| checked_as_of_label | SM/SC.Accessed | Exact SM/SC.Accessed; inline-only NULL. | Source tuple | Do not use release date or poll publication date as access date. |
| evidence_grade | SM/SC.Evidence grade | Verbatim for catalogue; NULL inline. | Source tuple | Kept separate from publisher and legal_outcome. |
| file_sha256 | No downloaded source-page bytes supplied | NULL. | Source tuple | Package/table hash is not remote document hash. |
| locator | No source-page locator supplied as separate field | NULL. Occurrence locations belong to evidence_link.source_locator. | Source tuple | Do not mistake workbook row for remote PDF page. |
| data_rights | No rights grant supplied | `unknown`. | Source tuple | Public URL does not imply reuse license. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | All SM/SC rows belonging to source or actual inline occurrence list | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## record_locator

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| record_key | Typed target key | `rec-`+SHA256(C([entity_kind,...ordered target PK components])); input key includes L,input_path but excludes R. | record_key | No public URL replacement; collision guard compares full target tuple. |
| entity_kind | Target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input per shape below. | record_key | No unsupported date/tier/metric entity kind. |
| country_id | Typed target country | austria except input=NULL. | record_key | Country FK and exact target shape. |
| geography_id | G only for geography target | G or NULL for every other kind. | record_key | Exact shape/FK. |
| id_namespace | Office/event/result/proceeding target | N for those kinds; otherwise NULL. | record_key | Never partial namespaced key. |
| office_id | Office/event/result/proceeding target | Exact target office ID; otherwise NULL. | record_key | FK real typed row. |
| history_key | Event/result/proceeding target | Exact target HK; otherwise NULL. | record_key | FK full event tuple. |
| proceeding_id | Proceeding target only | NULL baseline; never fill for result target even if later result has proceeding. | record_key | DDL one-target shape. |
| result_row_id | Result target only | Exact result ID; otherwise NULL. | record_key | FK exact result tuple. |
| party_namespace | Party-mapping target only | NULL baseline; source result party label does not make party locator. | record_key | No party mapping target; party/list strings stay election-scoped result context. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No baseline target of this kind. |
| source_namespace | Source target only | country-package-austria for source; otherwise NULL. | record_key | All source key components present together. |
| source_id | Source target only | Canonical source ID; otherwise NULL. | record_key | FK existing catalogue/inline row. |
| input_path | Input target only | retained_input.input_path; otherwise NULL. | record_key | FK (L,R,input_path). |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| source_row_locator | Owning source row/field or artifact | C(locator) defined in Source notation; includes member archive_entry, exact source_rows[i], pointer and SHA. | record_key | A canonical origin, not all citations; every evidence occurrence has its own locator. |

## evidence_link

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| evidence_id | Resolved citation occurrence + target + claim kind | `ev-`+SHA256(C([record_key,source tuple,occurrence identity,claim_kind])); exclude value/R. | evidence_id | No duplicates/collision reassignment; changed claims retain occurrence identity. |
| record_key | Actual supported record or retained input | Use typed locator; unresolved target is a broken reference, not unresolved evidence. | evidence_id | FK record_locator. |
| source_country_id | Resolved source country | austria. | evidence_id | Exact source FK. |
| source_namespace | Resolved source namespace | country-package-austria. | evidence_id | Exact source FK. |
| source_id | Exact catalogue token/URL resolver | Canonical ID under source rules. | evidence_id | Must exist; known source omitted from stage fails closed. |
| source_locator | Original citation field/HTML anchor occurrence | C(locator), retaining original field, index and token; remote page only if actually supplied. | evidence_id | Reopens original retained bytes; no fictitious PDF page. |
| claim_kind | Field purpose | H/IX event and date; D result; Cal/Nts calendar_context; poll input poll; BF artifact_reference; T retained-input classification FK. | evidence_id | Poll remains retained input; no poll table or forecast. |
| date_claim_id | H or IX-only date supported by occurrence | Actual date_id only when claim_kind=date; otherwise NULL. | evidence_id | Only claim_kind=date gets real research_date ID. Exact annotation locator accompanies all 58 day claims. |
| claim_json | Original row/claim and source token; optional override decision | Raw evidence envelope; original and resolved claim separated, original input/hash preserved. | evidence_id | Keep both claims on conflict; never just overwrite losing claim. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |

## unresolved_evidence

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched citation occurrence | `unres-`+SHA256(C([record_key,occurrence identity,original_token])). | unresolved_id | No random ID; do not demote a previously resolved missing FK. |
| record_key | Actual record/input containing token | Typed locator. | unresolved_id | Target FK still required. |
| original_token | Citation field / explicit citation markup | Exact nonblank unmatched token. | unresolved_id | Do not classify arbitrary prose, party labels or local navigation as citations. |
| source_locator | Original field/occurrence | C(locator), mandatory. | unresolved_id | Retained bytes must contain token. |
| reason | Resolver outcome | `unmatched_catalogue_token`, `invalid_url`, or `ambiguous_catalogue_match`, with explanatory raw details. | unresolved_id | Nonempty; baseline designated citation fields all resolve. No fabricated source rows. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | unmatched original occurrence | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## identity_crosswalk

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| entity_kind | Preserved source/bridge alias type | Same supported locator entity_kind. | (entity_kind,upstream_namespace,upstream_id) | Typed FK target exists; no release/entity mismatch. |
| upstream_namespace | Identity Rules alias namespaces | Exact namespace per alias family; no release hashes. | Crosswalk PK | Country/election scoped when IDs reuse. |
| upstream_id | Original O/H/event/G/result/source ID or row binding | Verbatim ID; row-binding aliases use canonical tuple string. | Crosswalk PK | Immutable target; ambiguous aliases fail, never last-wins. |
| record_key | Canonical typed target | Existing locator key. | Crosswalk PK | Same entity kind; source URL alias points to catalogue when matched. |
| reason | Alias transformation | preserved_package_id, proposed_bridge_compatible_id, package_source_id, exact_url_catalogue_alias, baseline_row_binding, documented_identity_correction. | Crosswalk PK | No claim that proposed Austria events are already-public aliases; future correction needs retained override. |
| lineage_id | Owning package M / staged lineage | `L = country-package-austria`. | Owning table PK | FK selected publication pair for active projection; dataset_release FK lineage only. For empty proceeding/party_mapping: NO ROW. |
| release_id | Validated effective-input fingerprint | `R = L + "--sha256-" + fingerprint_sha256`. | Owning table PK | Every active Austria row points to same selected R. Carry-forward retains original origin inside raw_json; empty tables: NO ROW. |
| raw_json | original alias tuple and binding origin | Raw envelope defined above, preserving every original value; empty proceeding/party_mapping: NO ROW. | Owning table PK | Original JSON/row equality; original byte hash and location remain recoverable; no researcher claims added. |

## publication_release

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Validated staged lineage plus prior publication set | L for this import; retain every unrelated selected lineage. | lineage_id | One selected release per lineage; no Europe-only filter. |
| release_id | Successful candidate fingerprint or unchanged prior release | R; unchanged inputs reuse existing metadata row. | lineage_id | Deferred FK dataset_release; failure leaves prior selection. |

## publication_receipt

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| singleton | Operational protocol | 1. | singleton | One receipt for physical publication. |
| last_publish_attempt_id | Current ledger attempt ID | Copy actual started attempt ID; not R. | singleton | Logical cross-file match during recovery. |
| attempted_lineage_id | Current attempt lineage | L. | singleton | FK selected publication pair. |
| attempted_release_id | Current validated staged release | R, including unchanged re-import. | singleton | Physical receipt persisted before swap; compare ledger after restart. |

## ingest_attempt

| Destination column | Source locator / field | Conversion / null policy | Identity rule | Evidence / FK / validation |
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
| publication_set_json | Verified master.publication_release | NULL started/failed; sorted array of {lineage_id,release_id} succeeded. | attempt_id | Entire set, not only Austria. |
| row_counts_json | Validated candidate counts / partial failure diagnostics | NULL initially; counts object on success; failure may retain diagnostics clearly labelled partial. | attempt_id | Success counts equal dataset_release validated counts. |
| error_text | Actual failure exception and input/constraint location | NULL started/succeeded; nonempty failed. | attempt_id | No success pointer on failure; redact secrets without losing actionable diagnostic. |

## Date policy and cycle identities

All H.Actual ballot date, if recorded cells are null; all IX ballot-date cells empty. Ordinarily use the explicit Year with precision=year, month/day=NULL, certainty=unknown. **Five exact Round / basis strings below supply explicit actual days**; normalize only their named-date substring, preserve the whole original phrase and null cell raw. This is a documented source-field conversion, not an invented polling day. No general prose/date scraping. Exactly58 day values and 5898 year values result.

| Exact Round / basis | Label / year-month-day | Rows |
| --- | --- | ---: |
| Decisive mayoral runoff, 11 October 2015; Valid candidate/list votes | 11 October 2015 / 2015-10-11 | 44 |
| Decisive mayoral runoff, 23 October 2022; Valid candidate/list votes | 23 October 2022 / 2022-10-23 | 11 |
| 2022 cycle: decisive repeat mayoral runoff 3 September 2023; Valid candidate/list votes | 3 September 2023 / 2023-09-03 | 1 |
| 2017 cycle: decisive repeat council election 9 September 2018; Valid candidate/list votes | 9 September 2018 / 2018-09-09 | 1 |
| 2017 cycle: decisive repeat mayoral runoff 7 October 2018; Valid candidate/list votes | 7 October 2018 / 2018-10-07 | 1 |

The three repeat histories retain cycle HKs2022/2017 while date.year is2023/2018. Do not rewrite identity using normalized ballot date; D still joins the original HK. First/decisive/runoff wording is retained, not a license to create extra first-round/result/proceeding records. The original annulled ballot is narrative provenance; do not resurrect it as an additional selected history. No structured proceeding IDs/sequence/supersession graph are supplied, so proceeding is empty. Certified-seat wording in three index-only Lower Austria histories is retained and does not certify the whole event.

All historical certainty=unknown; source grade remains separate. Future full YYYY-MM preserves month precision; unknown date/year creates explicit unknown research_date with nonnull event.date_id, because DDL requires it for unknown/resolved; conflicting date claims retain separate research_date/evidence records, selected event pointer NULL and resolution=conflicting. Office next pointer and next_history_key also withheld on conflict. Range endpoints require actual source-provided values and noncyclic ordered IDs. No generic cohort endpoints, expected2027/2028 prose, term expiry or snapshot date become polling days.

## Four regional offices outside companion

| Office ID | Register jurisdiction/type | Register pointer | IX pointers | Detailed results |
| --- | --- | --- | --- | --- |
| AT-KTN-A | Carinthia / State legislature | /rows/208 | /610, /611, /612 | No D rows; summaries/artifacts retained |
| AT-NOE-A | Lower Austria / State legislature | /rows/879 | /2563, /2564, /2565 | No D rows; summaries/artifacts retained |
| AU-ab9fc7cefb | Tyrol / Regional legislature | /rows/1822 | /5322, /5323, /5324 | No D rows; summaries/artifacts retained |
| AU-9560299fb9 | Upper Austria / Regional legislature | /rows/1853 | /5415, /5416, /5417 | No D rows; summaries/artifacts retained |

Use O for office/geography/tier evidence and IX-only for event/date/source; J/H/D absence is legitimate, not a broken office FK. Preserve AU prefixes; never map them to Australia. IX leader/runner shares and BF narrative are retained summary claims, not invented detailed result rows, seats or votes. No current party-control inference. Regional office index can show four offices after approval; baseline **dated upcoming regional calendar has zero entries**, with label “Four proposed regional offices; no office-level next polling dates supplied. Tier approval and date research pending.” After approval omit only the approval-pending wording. Window2026-09-08–2028-03-08 is inclusive; expected dates possibly beyond it are not confirmed in-window events.

## Evidence traversal and unresolved tokens

SM 71 +SC 86 share64 metadata-identical IDs, yielding93 catalogue sources. Four actual inline-only URLs yield97. source-links lists26 URLs absent from master, but22 resolve in companion; never create26 extras. Resolve exact catalogue token first, then unique exact URL, and require simultaneous ID/URL references to agree. No URL normalization or invented metadata. Inline-only rows retain title/publisher/grade/access NULL. Source table hash is not remote-page hash; file_sha256=NULL for unprovided remote source bytes.

| Occurrence | Target and claim | Handling |
| --- | --- | --- |
| H.Source ID / Result source URL | event and date | Exact catalogue agreement; H date Year or explicit Round annotation locator accompanies claim |
| IX.Source URL | matched event/date | Retain distinct occurrence; no second event; index-only URLs attach real sources |
| D.Source ID / Source URL | result | Match source tuple, exact D locator; H limitations stay visible |
| O.Calendar evidence / J.Calendar source | office calendar_context, next date if supplied later | Baseline all null; no fake claim |
| Cal.Source URL | calendar retained input, calendar_context | No all-to-all office date assertion |
| Nts.Screen evidence / coverage.screen_source | country calendar_context | Exact real URL; screening context only |
| Poll.Source URL | retained Poll input, poll | Preserve sample/method/results/limits; no forecast or SQL poll table |
| J.Poll source if supplied | office context | Preserve exact supplied token, no invented poll row |
| BF external href | retained artifact, artifact_reference | Inert parser, exact anchor occurrence; relative navigation stays raw |
| T evidence | classification retained-input FK; source register/member locators raw | Artifact hashes prove provenance, not a fabricated source-catalogue entry |

Actual unrecognized citation token→unresolved_evidence with exact original token/locator/reason and real target record_locator. Real previously unknown HTTP URL can create inline source; malformed/ambiguous token cannot create fake source FK. A known resolved source omitted from staging is a fatal broken FK, never demoted to unresolved. Blank cells, workbook names, local navigation, prose and party labels are not unmatched source tokens. Baseline designated H/D references agree with catalogues. Full occurrence/evidence traversal is specified for future CI, not claimed importer-tested here.

## Master/companion citation differences and one stage-binding hold

Exactly46 overlapping histories have different H.Result source URL and IX.Source URL:45 agree on compared leader/runner/coverage values and retain both real citation occurrences, not duplicate events. One substantive exception is **AT-OOE-41119-M::2015:: (St.Georgen am Walde)**. H `/rows/4560` and D `/rows/12683`–`/rows/12686` explicitly retain the first ballot, leader514 votes/35.133287764866715%. IX `/4682` instead gives leader79.12087912087912%, blank runner. BF Office_Briefings/Offices/AT-OOE-41119-M.html, heading “2015 — Decisive 2015 yes/no mayoral ballot after withdrawal; no competing candidate”, external HTTP anchor1, contains1008 votes/79.12 and cites the official final report. Those are distinct source claims/ballot stages, not interchangeable numeric corrections.

**Production publication hold:** source-defined office/year/date keys collapse those stages into one HK. This version preserves the companion observations and every IX/HTML claim raw, with an explicit unresolved stage-binding issue in inventory and T.notes. It does not select a definitive final return, add a proceeding/event/result, drop four rows or replace514 with 1008. A future importer must fail pre-publication on this named unresolved binding until Justin accepts an evidence-backed stage/identity decision in a retained override. No invented unresolved source token: both sources resolve; the open issue is event/stage binding. Typed vectors are provisional mappings of supplied companion rows; they are not executable approval or a claim that this one event is reconciled. All 5956 history keys and 16336 detailed input rows remain inventoried. A future accepted binding may revise projected event/row expectations explicitly; source counts remain immutable.

Austria_Input_Inventory.json enumerates all 46 citation differences with locators and the one reconciliation_hold with both full claims and four exact candidate result IDs. Compare shared claims before deduplication; a future unexpected substantive disagreement also fails closed. URL difference alone is not numerical conflict. Example 17 demonstrates the baseline hold.

## Research reviews and retention

T.notes groups exact existing office IDs with original J.Notes locators, including552 Tyrol offices, Carinthia gaps, boundaries and replacement-election watches. These are research questions separate from tier uncertainty. Do not reconstruct predecessor municipalities, infer present mayor from ordinary-cycle history, or convert no candidate return to a zero-vote candidate. The four regional offices carry focused tier-review flags until Justin accepts. Every pack row remains draft regardless of those flags.

Krems/Waidhofen/Graz notes have no matching register IDs for those named jurisdictions; they stay country/cohort issues with office_ids=[] rather than invented IDs or guessed matches to Krems in Kärnten. Polling lower confidence, local-list identity and score-gate fields stay raw; no tightness, volatility or competition computation. Coverage complete=0 is inferred from explicit package gaps, not from a nonexistent boolean field. Complete mapping is not complete research.

## Publication protocol (future implementation only)

Separate durable ledger records started attempt before staging. Use a consistent SQLite backup of last good master to same-filesystem staging; preserve unrelated lineage rows and release selections. Validate tier approval, payload/effective input hashes, domain/semantic/SQL FKs, fixture exclusion and counts before committing candidate release. Retain on-VPS last-good and off-VPS backups. Checkpoint WAL TRUNCATE with zero busy/uncheckpointed frames, close handles, fsync staging, atomic rename, fsync parent and safely reopen readers with no stale WAL/SHM. Persist publication_release full set and receipt before swap; finish ledger success only after verified swap. Crash recovery compares receipt/attempt; failure leaves previous publication serving and durable failed audit. No release publicly minted for failed staging.

Unchanged inputs create new attempt, same R. Incomplete refresh cannot delete omitted records; effective retained inputs include prior origins and hash-addressed inherited paths. Accepted corrections need exact original guards and evidence; none supplied for Austria. Other lineages, approved tiers and Mexico overrides remain untouched. Draft T blocks production, while schema permits needs_review for review staging. All importer/publication/SQLite/VPS/UI execution is Not run.

## Complete source-column disposition

Every source column is retained in full input JSON and original row envelope even when also projected. j is explicit; tables preserve original sheet/source_rows. Unknown future columns remain raw and trigger mapping review if semantically significant; never become invented SQL columns.

### tables/companion/briefings.json

2034 rows, sheet `Briefings`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Jurisdiction ID | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Country | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 2 | Jurisdiction | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 3 | Election briefing | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/companion/full-results.json

16336 rows, sheet `Full results`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Jurisdiction ID | result office/event FK |
| 1 | Year | HK cycle year +party_namespace |
| 2 | Party / list | party label/code; display fallback; semantic binding |
| 3 | Candidate / ticket | candidate label preferred when supplied; semantic binding |
| 4 | Votes | votes and votes_status |
| 5 | Share | share and share_status, percent_0_100 |
| 6 | Seats | seats and seats_status; missing vs zero |
| 7 | Source ID | resolved result evidence |
| 8 | Source URL | resolved result evidence |
| 9 | Actual ballot date, if recorded | original HK event join, null preserved |
| 10 | Election cycle key | semantic binding; raw |
| 11 | Vote basis | crosscheck event ballot basis; raw denominator notes |

### tables/companion/histories.json

5944 rows, sheet `Histories`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Jurisdiction ID | event office ID |
| 1 | Country | country assertion |
| 2 | Jurisdiction | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 3 | Year | HK cycle year; date fallback year |
| 4 | Leader / ticket or party | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 5 | Leader party | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 6 | Leader vote share | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 7 | Runner-up / party | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 8 | Runner party | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 9 | Runner vote share | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 10 | Gap, pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 11 | Leader seats | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 12 | Round / basis | exact day allowlist, event_kind and ballot_basis; original raw |
| 13 | Coverage | event comparability/raw; not blanket legal certification |
| 14 | Source ID | resolved event/date evidence |
| 15 | Actual ballot date, if recorded | HK raw segment (empty); explicit date source if later supplied |
| 16 | Election cycle key | raw cycle context; result semantic binding crosscheck |
| 17 | Result source URL | resolved event/date evidence |
| 18 | Actual election return | research limitation flag raw; never discard selected source history |
| 19 | Competition eligible | retained score gate; no calculation |

### tables/companion/jurisdictions.json

2034 rows, sheet `Jurisdictions`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Jurisdiction ID | exact O join; preserve companion alias |
| 1 | Country | country assertion |
| 2 | Jurisdiction | crosscheck O; raw |
| 3 | Office | crosscheck O; T evidence |
| 4 | Next date | crosscheck O; all NULL |
| 5 | Result cycles | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 6 | Latest available gap | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 7 | Middle gap | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 8 | Oldest gap | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 9 | Weighted gap | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 10 | Competition score | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 11 | Historical flag | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 12 | Pedersen interval 1 | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 13 | Pedersen interval 2 | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 14 | Mean grouped volatility | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 15 | Margin dispersion proxy | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 16 | Volatility flag / basis | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 17 | Coverage status | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 18 | Polling / government watch | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 19 | Poll source | source resolver; no metric |
| 20 | Notes | open research reviews, raw; no fabricated date |
| 21 | Term expiry (not polling day) | raw only; never polling date |
| 22 | Calendar source | source resolver if supplied |

### tables/companion/parameters.json

14 rows, sheet `Parameters`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Assumption | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Value | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 2 | Meaning / source | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/companion/read-me.json

16 rows, sheet `Read me`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Field | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Value | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/companion/sources.json

86 rows, sheet `Sources`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Source ID | source.source_id |
| 1 | Title / dataset | source.title |
| 2 | URL | source.url |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

### tables/master/country-coverage.json

1 rows, sheet `Country coverage`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Country or territory | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Office records | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 2 | Historical entries | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 3 | Three entries | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 4 | Competition scores | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 5 | Grouped volatility scores | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 6 | Sourced current control | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 7 | Calendar cohorts | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/master/country-notes.json

1 rows, sheet `Country notes`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Country or territory | country assertion |
| 1 | Scope and remaining gaps | country.notes +raw |
| 2 | Election calendar | country.raw_json; no per-office dates |
| 3 | Detailed workbook | off-payload workbook recovery metadata |
| 4 | Screen evidence | country evidence context |

### tables/master/election-calendar.json

8 rows, sheet `Election calendar`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Cohort ID | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 1 | Country | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 2 | Election cohort | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 3 | Tier | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 4 | First or scheduled date | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 5 | End or runoff date | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 6 | Date status | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 7 | Historical cycles | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 8 | Coverage and timing | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 9 | Prior-call units if known | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |
| 10 | Source URL | retained calendar input; Source URL also resolves calendar_context evidence. No cohort→tier/office/event expansion. |

### tables/master/office-register.json

2038 rows, sheet `Office register`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Office ID | office.office_id; T join and crosswalk |
| 1 | Country | country/office FK assertion |
| 2 | Jurisdiction | geography name/key; office name |
| 3 | Office | office_type/name; geography key; T evidence |
| 4 | Next polling date | office next pointer; all NULL baseline |
| 5 | History entries | reconciliation count only |
| 6 | Latest eligible gap pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 7 | Middle gap pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 8 | Oldest gap pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 9 | Weighted gap pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 10 | Competition score | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 11 | Historical competition screen | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 12 | Pedersen interval 1 pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 13 | Pedersen interval 2 pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 14 | Mean Pedersen pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 15 | Margin dispersion pp | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 16 | Volatility interpretation | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 17 | Polling and government watch | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 18 | Historical coverage | office.raw_json; limitations retained |
| 19 | Detailed workbook | original archive artifact provenance; not payload XLSX |
| 20 | Calendar evidence | evidence resolver if nonnull |

### tables/master/parameters.json

12 rows, sheet `Parameters`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Assumption | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Value | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 2 | Definition | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/master/polling-evidence.json

1 rows, sheet `Polling evidence`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Country | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 1 | Scope | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 2 | Pollster | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 3 | Publication date | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 4 | Fieldwork start | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 5 | Fieldwork end | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 6 | Sample n | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 7 | Method | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 8 | Result | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 9 | Comparison | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 10 | Assessment | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 11 | Limits | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |
| 12 | Source URL | retained poll input only; Source URL also resolves poll evidence. Dates here are poll dates, not ballot dates. |

### tables/master/read-me.json

13 rows, sheet `Read me`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Topic | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |
| 1 | Use and interpretation | retained_input.payload_json; row raw_json when attached. No new metric/control/poll field. |

### tables/master/sources.json

71 rows, sheet `Sources`. `/rows/i/j`, worksheet row `source_rows[i]`.

| j | Exact column | Destination / handling |
| ---: | --- | --- |
| 0 | Source ID | source.source_id |
| 1 | Title | source.title |
| 2 | Source URL | source.url |
| 3 | Evidence grade | source.evidence_grade |
| 4 | Accessed | source.checked_as_of_label |

### Other members and IX columns

IX fields Office ID/Country/Jurisdiction/Year/Ballot date if recorded bind event identity/date; Source URL resolves evidence; Coverage and Comparability status populate comparability. Leading candidate or party/Leader share/Runner-up candidate or party/Runner-up share remain summary raw, not result rows. Vote basis supplies event denominator convention. All 13 keys and exact strings preserved. formula-cache.json retains formulas/attributes/caches without recomputation. source-links.json retains observed links and reconciliation metadata. inventory.json retains original source entries and member hashes. All 2039 HTML files are inert retained artifacts; companion briefings are retained text/HTML references. Shared master Parameters/Read me are regional methodology, never Austria totals. Original archive bytes and workbooks are verified recovery provenance, not permission to load another country.
