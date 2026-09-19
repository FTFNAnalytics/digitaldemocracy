# Bulgaria identity rules

Prompt P draft, main `00c2ea7458ad7705aad487c4a7665d9d343b5554` and PR #16 `de3541276cd37ca749b740c229cee67475f0d317`. [Field Map](Bulgaria_Field_Map.md) defines values; [Vectors](Bulgaria_Identity_Vectors.json) enumerate all 3597 office/geography bindings, 8661 event/date bindings, 25817 result identities, 3973 canonical sources and 10337 retained stage-row bindings. Source office IDs are preserved; generated keys are proposed adapter outputs, not a claim of already-public Bulgarian Atlas records.

## Constants and canonical bytes

| Constant | Value |
| --- | --- |
| CID / country code / polity | bulgaria / BG / sovereign_country |
| Office/event namespace N | cdd-observatory-v1 |
| Lineage L and source namespace | country-package-bulgaria |
| Proposed adapter | atlas-bulgaria-field-map/1 |
| Method / schema | atlas-preserve-evidence/1 / atlas-master/1 |
| Draft tier path | schemas/atlas/tiers/bulgaria.json |
| Draft tier SHA | cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0 |

C(value) is pinned scripts/import/normalize.ts stable / lib/atlas/identity.ts canonical: recursively sort object keys by JavaScript UTF-16 order, preserve array order, JSON.stringify, UTF-8, no BOM/indent/final newline. Match JavaScript escaping and numeric rendering; reject duplicate keys, undefined, nonfinite numbers and unpaired surrogates. No Unicode, case or whitespace normalization of identities. SHA=full lowercase SHA-256. key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]. Internal rec/date/ev/unres IDs use full digest. Compare complete identity tuples on collision; never overwrite. Only attempt_id is random: attempt- plus lowercase UUIDv4.

## Office and geography identity

Office PK=(N,exact O. Office ID). O/J register rows are identical and contain3597 unique IDs. No district/village omission, no additional mayor row, no separate regional office from codes or calendar cohort. The supplied265 Mayor and 265 Municipal council entries remain distinct offices; no claim that3597 offices equals3597 municipalities.

Bulgaria needs an explicit geography disambiguation rule: **G=key("geo",[CID,office_id])**. All 3597 Gs are unique. The generic name/type formula key("geo",[CID,Jurisdiction,Office]) gives3239 keys:272 collision groups across 630 offices. For example BG-BLG52-fc5837f6a1-V and BG-PAZ08-fc5837f6a1-V both label Абланица / Village mayor but are distinct register IDs. These may not be merged. Vectors contain the old name/type key and legacy_alias_safe flag; Inventory lists every ambiguous group. Retain old key as provenance; create a legacy alias only if it has exactly one target. Do not redirect an ambiguous legacy key to whichever row loads first. This is a versioned country adapter choice, not a rewrite of other-country identities.

Geography is an office-bound source jurisdiction reference, not a claim of 3597 unique municipalities. Exact jurisdiction name/type remain labels; parent/effective datesNULL. Do not infer hierarchy from encoded province/municipality fragments. Future display correction retains G; sourced boundary/identity replacement needs an explicit reviewed binding. Both mayor/council geography references remain separate under this contract, without double-counting the underlying municipality.

T proposed tiers:3597 municipal; 0 regional/national/council/other. 3067 district/village rows remain human_review_required=true, tier_uncertain=true. 530 municipality-wide rows have no focused flag but pack is still draft. Current DDL admits national_context/regional/municipal/other; unused legacy council metadata is not emitted. Future unknown/hold→NULL+unknown review, never unknown→other. Approval must be explicit and changes T hash and R.

## Histories and cycle identity

cellText(null)=empty string; string unchanged; finite number→JS String(number); other types fail. cellYear=integer number or trimmed exactly-four-digit string, otherwise NULL. Validate year domain independently. General year_part=decimal cellYear, else exact nonempty cellText(Year), else undated.

**HK=Office ID+"::"+year_part+"::"+cellText(Ballot date if recorded).** event_id=key("event",[CID,HK]); PK=(N,office_id,HK), unique=(N,event_id). All result/proceeding event FKs carry N and office_id, not just event_id. H has 8661 unique keys and one H per(Office ID,Year); IX has exactly the same 8661 keys and all shared values equal after table-null↔CSVempty, numeric↔exact numeric-string normalization. H is the typed source; IX is reconciliation provenance and adds zero events. There is no master history table. J duplicates O, not more offices.

D25817 binds to H by full HK. No matching on date proximity, name, URL alone or last-three-calendar-years inference. Selected records may include replacement cycles; retain their actual source Year/date. event_kind stays unknown because H lacks a structured kind field; HTML phase wording stays raw. legal_outcome unknown because source caveats do not establish final certificates verified. selected_history_role=selected does not override comparability or completeness.

All 8661 historical dates are full ISO day cells. date_id=date-+SHA(C([N,"event",event_id,"ballot"])); precision=day, certainty=unknown; exact Gregorian year/month/day parsed from source. Date_resolution=resolved denotes a single recorded value, not independent confirmation. No baseline range or partial label exists. Future YYYY-MM/year/range must retain precision; unknown event date requires an explicit unknown research_date under DDL, not day1. Conflicting sourced dates retain independent claims, set selected date_idNULL/date_resolution=conflicting, and require reviewed resolution.

All O. Next polling date cells are NULL and Cal has no scheduled/end dates. Thus office.next_date_id=NULL, next_history_key=NULL, next_date_resolution=unknown, and **no prospective event**. Expected autumn 2027 prose is not a supplied office ballot date. A future explicit office next date may use established key("next",office_id), HK=same key, only after reviewed cycle binding; do not reuse one next ID for a later distinct contest. An accepted correction to a key-bearing historical date must bind full old PK/HK/event_id and incoming tuple so existing public identity remains addressable.

## First-round and unresolved policy

Minimum typed projection is H+D only. All 7746 F and 2591 X rows remain lossless retained_input, each with full original row, path/hash/pointer and canonical source ID in Vectors. There are **zero typed proceedings** in this baseline. This is an explicit deferred projection decision for stage observations, not a claim that first-round evidence is absent. It avoids inventing stage IDs, sequencing or decisive status not uniformly encoded by F. Users must be able to inspect retained original artifacts; no fabricated completed histories.

F has 1482(Office ID,Year) groups. 7740 rows in 1481 groups have one candidate H of the same office/year; Vectors records candidate HK/event_id, with candidate_is_authoritative_stage_binding=false. Year-only correspondence is not permission to publish it as a separate event or attach a formal proceeding. The remaining 6 rows (/rows/1665…1670) belong to BG-SLV11-b88d0d4475-V2015 and have no selected H. X includes2 related unresolved qualification-change runoff rows. No stage or result ID minted for these observations; their immutable row locators are sufficient identity in retained input.

X has 559 office/date/phase groups; no Office ID+ballot-year group overlaps H. Preserve Phase and Missing evidence verbatim. Phase counts:2466 Unresolved historical first round; 108 Replacement or repeat first round; 15 Unresolved historical runoff; 2 Historical runoff with unresolved qualification change. They are research evidence, not completed cycles. A future promotion requires primary outcome/qualification evidence, explicit event/stage identity binding, source guards and reviewed version/override. Preserve original claims; never copy first-round votes into a decisive result field.

## Result IDs and value semantics

Process D /rows in original order; result_row_id=event_id+"-r"+zero-based encounter index within HK. Do not sort by candidate/vote before assigning baseline IDs. 25817 unique result IDs and semantic tuples verified.

Two crosswalks per result:

- bulgaria:baseline-result-row → C([original_input_path,original_sheet,original_source_row]).
- bulgaria:result-identity → C([N,office_id,HK,Electoral unit,Candidate or list,Party or proposer]).

Exclude votes/shares/seats/R from identity. Refresh resolves semantic binding or accepted explicit identity override; physical row order alone cannot retarget an existing result. New tuples in an existing event allocate indices above all ever assigned, sorted by C(tuple) for simultaneous additions; never recycle omitted indices. Ambiguous renamed/duplicate candidates require reviewed binding. Do not harmonize original coalition/party labels into unsupported groups.

candidate_or_list_label=nonempty Candidate or list, else Party or proposer, else NULL. original_party_label and original_party_code preserve Party or proposer under the existing combined-label/code convention; party_namespace=bulgaria/<source cycle Year>. No party_mapping, no inferred elected/substitute flag, no typed proceeding link. 587 missing vote values→NULL/unknown, 26 reported zeros→0/zero, 25204 positives→recorded. Share values remain percent_0_100 without recalculation:28 zero, 25789 positive. Seats14247 zero/11570 positive. Two reported zero-share rows have missing vote counts; retain independent value/status pairs. Source evidence_status=recorded describes a supplied observation, not certification. Percentage-only 587 rows across 221 events retain unknown ballot_basis and all denominator/coverage qualifiers.

## Sources, typed locators and evidence

Union SM/SC by exact Source ID:2809 shared equal rows, 3971 distinct catalogue IDs and unique URLs. SID=bulgaria--+Source ID. Keep both origins for shared catalogue rows; metadata conflicts must fail review. Two genuine inline URLs—CIK homepage and the supplied2027 screening page—use SID=bulgaria--+key("url",exactURL); total3973. Preserve exact path/query/encoding/archive timestamp; no catalogue remap. Title/grade/Accessed copy source metadata; inline fieldsNULL. Publisher, rights/page hash are not inferred (publisher/file_sha256NULL; data_rights unknown). Source table hash is not the remote document hash.

Resolve exact token then unique exact URL; preserve bare catalogue and prefixed IDs plus URL aliases. A genuine unmatched http(s) URL may create an inline source from that exact occurrence. Invalid/unmatched/ambiguous tokens become unresolved_evidence; missing known resolved source remains fatal FK. No fabricated FK or publisher to pass validation.

record_key=rec-+SHA(C([entity_kind,...components])):

| entity_kind | Ordered components |
| --- | --- |
| country | [CID] |
| geography | [CID,G] |
| office | [N,office_id] |
| event | [N,office_id,HK] |
| result_row | [N,office_id,HK,result_row_id] |
| source | [CID,L,SID] |
| input | [L,input_path] |
| proceeding / party_mapping | None baseline; future contract requires full existing typed key |

Set only target-shape columns permitted by DDL; unused keysNULL. Real typed/input FK required. Input rec identity excludesR but input FK includes current L/R. No date, tier, release or metric locator kind.

Occurrence tuple=[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]; explicitNULLs for absent components. Evidence ID=ev-+SHA(C([record_key,[CID,L,SID],occurrence_tuple,claim_kind])). unresolved_id=unres-+SHA(C([record_key,occurrence_tuple,original_token])). Baseline designated URLs resolve; unresolved=0. H date claims point to existing date_id; all other date_claim_idNULL. F/X citations target their retained-input locator, never a guessed H. Detailed enumeration is in Field Map → Evidence occurrences and exact targets. Multiple copied occurrences are not independent corroboration. Preserve losing claims and exact origin on accepted correction; no averaging or last-wins.

## Crosswalk families

| Family | upstream_namespace | Upstream ID → target |
| --- | --- | --- |
| Source office | bulgaria:office-register | exact Office ID→office |
| Proposed compatible office/event/result/country/source | observatory:bulgaria | respective exact/projected ID→typed target |
| Geography office binding | bulgaria:geography-office-code | exact Office ID→G |
| Geography canonical | observatory:bulgaria | new G→geography |
| Unambiguous legacy geography | bulgaria:legacy-geography-name-type | old key only where legacy_alias_safe=true→G |
| History | bulgaria:history-key | exact HK→event |
| Bare catalogue | bulgaria:source-catalogue | Source ID→source |
| URL | bulgaria:source-url | exactURL→source |
| URL-key alias | observatory:bulgaria | bulgaria--key(url,URL)→canonical source |
| Result physical/semantic | namespaces above | exact C(tuple)→result |
| Office briefing | bulgaria:briefing | exact office_id+.html→input |

Crosswalk PK=(entity_kind,upstream_namespace,upstream_id); same-kind target mandatory, conflicts fail. No F/X research aliases: exact member/hash/pointer identifies retained rows. No invented public release alias; dataset_release.upstream_release_idNULL. Proposed alias names do not claim prior public ingestion.

## Fingerprint and incomplete refresh

Inventory contains complete canonical hash object: canonicalization=atlas-c14n/1, hash_algorithm=sha256, lineage_id=L, inputs sorted by input_path, overrides=[], adapter_version/method_version/schema_version, and sorted logical DDL descriptors0001/0002 with exact byte hashes. Each input has input_path,input_kind,sha256,byte_count. 54 outer+3617 members+T=3672 descriptors. HTML/chunks are artifact, T tier_classification, other files package. Retain original bytes; shared archive/workbook hashes are provenance inside manifests, not cross-country record dependencies. Exclude attempt/time/operator/git tip/absolute scratch paths/unrelated lineages and this report from hash.

Fingerprint=SHA(C(hash_inputs)); R=L+"--sha256-"+fingerprint.

- Draft fingerprint `51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba`
- Draft candidate R `country-package-bulgaria--sha256-51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba`

Draft T blocks production; Justin approval/revision changes its hash and R. Unchanged approved effective inputs reuseR with a fresh attempt. Changed packages/tiers/accepted overrides/adapter/method/schema changeR. Failed attempts mint no public release. DDL/SQLite execution is not part of hash verification.

Future overrides follow atlas-override/1: full target key, exact typed expected_original, replacement, decision/reason, original origin and claims[], identity_binding/supersedes where needed. NULL guard is exact, not wildcard. Reject duplicate/unsupported/conflicting guards and supersession cycles; preserve original claims. Draft documentation is not executable approval.

Incomplete package omissions cannot delete offices, histories, results, sources, tiers or aliases. Carry prior records with original evidence and inputs, use inherited/sha256/<oldhash>/<original_path> for changed-path collisions, include inherited descriptors in effective hash, and require exact effective-office tier coverage. Never mint an inherited row on first import. Explicit sourced withdrawal keeps IDs addressable. Data citations use the record's own (L,R), not latest receipt. Other countries/continuity/Mexico rows and release IDs remain unchanged. Same-FS staging, durable ledger, backup/WAL/fsync/atomic rename/recovery gates remain **Not run**.
