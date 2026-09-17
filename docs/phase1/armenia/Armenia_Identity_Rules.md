# Armenia identity rules

Prompt L documentation contract, pinned main `7af805b5dbb123c4cd3f0e6ccd2ea63bc5f34d45`. Approved Armenia tier bytes are finalized first: **`2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`**, predecessor draft `9b100ffab2b9f878914721711d4878567868bd5ac923b294af02ef15bbfaefe5`. [Field map](Armenia_Field_Map.md) defines values and evidence; [identity vectors](Armenia_Identity_Vectors.json) enumerate all 71 offices/geographies, 63 events/dates, 97 results and 20 canonical sources with exact input hashes/pointers. No importer has been written or executed.

## Constants and canonical encoding

| Constant | Value |
| --- | --- |
| N: office/event namespace | cdd-observatory-v1 |
| L: lineage and source namespace | country-package-armenia |
| country_id / country_code / polity_kind | armenia / NULL (not supplied) / sovereign_country |
| Proposed adapter version | atlas-armenia-field-map/1 |
| Method / schema | atlas-preserve-evidence/1 / atlas-master/1 |
| Approved tier path | schemas/atlas/tiers/armenia.json |
| Approved tier SHA-256 | 2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a |

Use `C(value)` exactly as current scripts/import/normalize.ts stable (also lib/atlas/identity.ts canonical): JSON.stringify with recursive object-key sorting by JS UTF-16 order, original array order, UTF-8, no BOM/indent/trailing newline. Preserve JavaScript escaping/number rendering and numeric-property JSON semantics; a non-JS implementation must match exact bytes. Reject duplicate JSON keys, undefined, nonfinite numbers/unpaired surrogates; never normalize Unicode/trim identities. Hash descriptors use strings/integer lengths, not fractional research values.

SHA(s) = full lowercase SHA-256 of UTF-8 s. Bridge `key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]`. New internal IDs use full digest. Compare complete identity tuples on collisions; fail rather than overwrite. Only attempt_id is random (`attempt-`+lowercase UUIDv4). Research IDs never use time, database rowid, attempt ID or R.

## Offices and geography

O.Office ID is exact PK component under N; no trim/case/Unicode rewrite. The 71-source-ID set is authoritative. Eight IDs already ending in -M are genuine supplied mayor offices; preserve them.55 proportional councils that elect the mayor have no additional mayor office. Majoritarian councils and mayors retain separate supplied IDs. The unsuffixed legacy Vedi prompt token is not a valid alias. T set equals O set exactly; every tier is municipal. T outer tier-review flags are cleared under Prompt L; nested boundary/calendar research flags remain open and raw.

G=`key("geo",["armenia",O.Jurisdiction,O.Office])`.71 distinct bridge Gs, including separate office-type bindings in eight mayor/council pairs. Do not collapse them to 63 place names or rename keys based on presumed municipal geography. Parent/effective dates NULL; no geometry. Future spelling corrections retain established ID binding. Actual boundary replacement requires sourced identity binding, not a name-based merge.

## Historical and prospective event identities

Identity-strict cellText: null/absent→empty string, string unchanged, finite number→JS String(number), other types fail. cellYear: integer number or trimmed exactly-four-digit string, else null; independently validate year range. year_part is decimal cellYear when supplied, otherwise exact nonempty cellText(Year), otherwise literal undated.

H historical `HK=Jurisdiction ID+"::"+year_part+"::"+cellText(Actual ballot date, if recorded)`; IX uses Office ID and Ballot date if recorded. `event_id=key("event",["armenia",HK])`. Event PK `(N,office_id,HK)`; public uniqueness `(N,event_id)`. H and IX share 33 exact keys, selected once. D uses the same complete tuple, never office/year approximation. H33 are selected; IX is reconciled/retained, not 33 additional events. Older predecessor narratives are artifacts, not invented histories.

For each of 30 nonnull O.Next polling date cells preserve `event_id=key("next",office_id)` and HK=that event_id.41 null office dates produce no baseline next event. No random/date-based replacement for existing next IDs. A corrected date retains the same public next identity; a genuinely different later cycle requires a sourced explicit binding/versioned distinct identity before it can overwrite anything. Public HK/key correction uses a retained identity_binding with old full PK/HK/event_id and incoming tuple; store new alias to old identity. Actual distinct elections remain distinct even at the same office.

## Date identities and precision

`date_id="date-"+SHA(C([N,"event",event_id,"ballot"]))` for each of 63 event owners. Office next_date_id reuses its corresponding prospective event date_id.41 unknown office next dates keep NULL and resolution=unknown.63 baseline dates have day precision.33 histories certainty=unknown; 30 upcoming dates certainty=called based on explicit office-specific J.Notes “CEC day and community confirmed.” and source URL. This is source-reported confirmation, not fresh primary verification; keep evidence grade. Do not use concatenated cohort statuses, date range endpoints, term expiry or 2027 expectation as office dates.

Future full-string YYYY-MM or YYYY preserve precision with day or month/day NULL. Corrected date keeps owner identity; old value remains in prior release/claims. Known ranges use non-range ordered endpoints with slots ballot/start and ballot/end; never synthesize day1. For independent conflicting claims: owner_type=date_claim; owner_id=C([record_key,override_path,change_id+"/"+claim_id]); slot=value. General date ID uses date-+SHA(C([N,owner_type,owner_id,slot])). Retain both date/evidence rows, withhold selected office/event pointer and office.next_history_key with resolution=conflicting. No blank certainty promoted to statutory/called.

## Result row identities

Read D /rows in physical source order; group by exact HK. Baseline `result_row_id=event_id+"-r"+decimal(i)`, i zero-based per group.97 rows attach to 33 selected events; no prospective result rows. Bind two immutable aliases:

- Physical namespace `armenia:baseline-result-row`, upstream_id=C([original_virtual_input_path,original_sheet,original_source_row]).
- Semantic namespace `armenia:result-identity`, upstream_id=C([N,office_id,HK,D.Party / list,D.Candidate / ticket,D.Election cycle key]). All 97 tuples are unique. Strings/nulls exact; votes/share/seats are excluded.

Refresh uses existing semantic binding or accepted explicit identity override, not fresh row-number assignment. Physical row shifts cannot retarget a candidate. Corrected numeric values/reordered rows preserve public IDs. New tuples in existing events receive indices above all ever assigned, ordered by C(tuple) when multiple; omitted indices are never recycled. New events start r0 in incoming order. Duplicate/renamed/ambiguous party labels require explicit identity binding; never guess equivalence.

Party_namespace=`armenia/`+cellYear(D.Year), or literal unknown if absent later. original_party_label and original_party_code preserve exact Party / list token under existing bridge convention. candidate_or_list_label uses Party / list, then Candidate / ticket, else NULL; 97 party/list labels supplied and all 97 candidate cells null. No invented “Unlabelled source row.” No party_mapping IDs or proceedings supplied. A seats-only return is still a result record with votes/share NULL, not a missing row. Partial counts never yield inferred percent or seats.

## Source identities and evidence

Canonical source key `(armenia,country-package-armenia,source_id)`. source_id=`armenia--`+catalogue Source ID. Normalize only SM.Title vs SC.Title / dataset and SM.Source URL vs SC.URL field names; preserve values.15 shared IDs have equal metadata, giving 19 canonical catalogue sources from 34 physical rows. Keep both source-row origins. Resolve exact token first, then unique exact URL. A real inline-only URL gets `armenia--`+key("url",exact URL), with missing title/publisher/access date NULL. Only CRRC screening URL adds a source, making20. Do not infer a poll record from it.

All bridge URL-form aliases survive and point to canonical catalogue rows where matched. No URL normalization, host merging, invented source IDs or publisher from evidence grade. ID+URL disagreement or later conflicting same-ID metadata fails for review; an ambiguous token can remain unresolved with exact occurrence evidence. A known resolved source omitted by staging is fatal, not demoted unresolved.

 `record_key="rec-"+SHA(C([entity_kind,...ordered_components]))`:


| Kind | Ordered components |
| --- | --- |
| country | [country_id] |
| geography | [country_id,geography_id] |
| office | [N,office_id] |
| event | [N,office_id,HK] |
| proceeding | [N,office_id,HK,proceeding_id]; none baseline |
| result_row | [N,office_id,HK,result_row_id] |
| party_mapping | [country_id,party_namespace,mapping_id]; none baseline |
| source | [country_id,source_namespace,source_id] |
| input | [L,input_path] |

Unused typed locator columns NULL; one valid DDL target shape, existing FK. Input key excludes R while actual input FK includes current L/R. No locator entity kinds for dates, tiers, metrics or releases. Date claims target event/office, tier provenance points to retained T.

Occurrence tuple is `[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]` from field-map locator, excluding mutable SHA/R. `evidence_id="ev-"+SHA(C([record_key,[source_country_id,source_namespace,source_id],occurrence_tuple,claim_kind]))`. Multiple explicit claims append effective change_id/claim_id to occurrence tuple. `unresolved_id="unres-"+SHA(C([record_key,occurrence_tuple,original_token]))`. Prior bindings remain stable across location/value corrections; raw carries current physical location separately. Calendar date and certainty are one sourced prospective claim with exact separate locators in claim_json, not an invented source.

## Alias namespaces


Crosswalk PK `(entity_kind,upstream_namespace,upstream_id)` points to typed existing record_key of the same kind. Preserve prior aliases; contradictory targets fail.

| Alias | upstream_namespace | upstream_id / target |
| --- | --- | --- |
| Original office | armenia:office-register | Office ID → office |
| Bridge office/geography/event/result | observatory:armenia | exact bridge ID → matching entity |
| Original/accepted incoming HK | armenia:history-key | exact HK → event, including next IDs |
| Bare catalogue | armenia:source-catalogue | Source ID → source |
| Prefixed source/bridge URL alias | observatory:armenia | exact existing ID → canonical source |
| Exact URL | armenia:source-url | URL → source |
| Geography source-code | armenia:geography-office-code | Office ID → geography |
| Physical/semantic result binding | namespaces above | C(tuple) → result_row |
| Briefing | armenia:briefing | Office ID+.html → BF input locator |
| Country | observatory:armenia | armenia → country |

No poll/control aliases: no such records supplied. Release legacy alias is dataset_release.upstream_release_id=country-package-armenia, not a fictional record_locator target. BF/J predecessor contexts remain addressable by exact artifact/row locators; no fabricated public event IDs. Bridge competition metric aliases are not typed metric rows: retain their derivation key("ci",office_id) in office raw metadata if compatibility routing needs it; no unsupported metric record_locator kind. Bridge remaining-issue ID key("issue",["armenia","remaining"]) is likewise retained country coverage metadata, not an invented proceeding.

## Fingerprint and release identity

[Armenia_Input_Inventory.json](Armenia_Input_Inventory.json) contains every descriptor and exact canonical hash_inputs bytes. Shape: canonicalization=atlas-c14n/1; hash_algorithm=sha256; lineage_id=L; inputs=[{input_path,input_kind,sha256,byte_count}]; overrides=[]; adapter_version=atlas-armenia-field-map/1; method_version=atlas-preserve-evidence/1; schema_version=atlas-master/1; schema_inputs=[{input_path,sha256}]. Arrays sort by logical input_path using JS UTF-16 order, no duplicates across inputs/overrides.

Effective input universe is **8 tracked outer files+91 payload members+approved T=100**. Virtual member prefix `data/countries/armenia/unpacked/` plus exact tar entry is part of this versioned mapping contract. It is not a git path. Outer payload chunks, HTML and XLSX use kind=artifact; other package/member files=package; T=tier_classification. Each retained_input has exactly one hash descriptor. Member bytes are hash-verified after safe unpack; chunk hashes and concatenated payload hash verified before it. The outer inventory digest verifies unpacked inventory.json; its content list verifies other members. Hash inventory itself separately; no recursive self-hash. Do not add a derived concatenated gzip as an extra retained input; chunks already recover it.

Shared archive/workbook hashes in M/inventory are recovery metadata and not additional cross-country inputs. No undeclared temp files or scratch paths enter fingerprint. Approved T bytes come from this pack, replacing draft path content in the effective set. The predecessor draft digest remains audit metadata inside approved T; draft bytes are not an active classification input. Accepted applicable future overrides occur only in overrides[], kind=override. No override is supplied or approved for Armenia here.

Schema logical filenames follow lib/atlas/identity.ts (physical prefix schemas/atlas/migrations/):

- `0001_atlas_attempt_log.sql`: `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
- `0002_atlas_master.sql`: `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`

`fingerprint=SHA(C(hash_inputs))`; `R=L+"--sha256-"+fingerprint`. Documentation-only vector:

- Fingerprint: `d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e`
- Candidate release: `country-package-armenia--sha256-d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e`

Versions in typed dataset_release equal hash object values. Changing package/tier/accepted override/adapter/method/schema changes R. Exclude attempt ID/time/operator/absolute recovery locator/git commit/unrelated lineage or publication set. Immutable unchanged effective inputs create a new attempt, same R. No published-release or successful-attempt claim is made by these vectors. A future implementation must adopt this exact version or explicitly version any semantic changes.

## Overrides, incomplete refresh and publication

Future Armenia overrides under `data/overrides/atlas/armenia/` follow unchanged atlas-override/1 contract: lineage_id=L; changes[] with change_id,target_table,full target_key,field (or identity_binding),expected_original,replacement,decision,reason,origin,claims[],supersedes_change_id,identity_binding. Origin includes exact input hash/pointer; claims include claim_id,real source_id or source_url,locator,value,certainty(null for nondates). Decision values accepted/withhold/withdraw/supersede/identity_binding follow governing contract. Null expected_original is not wildcard. Reject wrong original, unsupported field/type, duplicate IDs and competing unsuperseded changes; topological explicit supersedes order then lexical input_path/change_id, cycles fail. Explicit operational binding may have empty claims; research replacements need sourced claims. Test probes are never production overrides.

Incomplete incoming package is not deletion. Carry omitted existing office/event/result/source/tier/evidence/alias rows with their original bytes/provenance. Old/new logical path collision → `inherited/sha256/<old_sha256>/<original_input_path>`; original virtual member path/archive_entry and original hash remain raw; typed retained-input/classification FK uses retained inherited path. Include every carried input in effective fingerprint. Incoming+carried classifications exactly cover effective offices with explicit conflict resolution. Fresh initial import cannot invent inherited records. No silent withdrawal or invented boundary replacement from the five open reviews.

All active Armenia rows point consistently to candidate R while old origin/release remains raw and prior release snapshots persist. Other lineage selections and rows/citations remain unchanged; readers resolve an office via its own lineage_id/release_id, never latest receipt. Publication is the full set of lineage releases. Separate durable ledger, same-filesystem staging/WAL checkpoint/fsync/atomic rename and receipt recovery follow Field Map and checklist. Failure leaves last good publication serving. No importer, DDL or VPS action is performed.
