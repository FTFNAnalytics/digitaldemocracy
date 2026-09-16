# Alderney identity rules

Prompt K documentation contract pinned to main `73b69bdd607c2ed5f70a93b52b5cd0c66f4155c9`. [Field map](Alderney_Field_Map.md) defines values/evidence; [Alderney_Identity_Vectors.json](Alderney_Identity_Vectors.json) enumerates every baseline office, geography, selected/prospective event, date, result and canonical source/URL alias. No new research ID system replaces the bridge.

## Constants and canonical encoding

| Constant | Value |
| --- | --- |
| Office/event namespace N | cdd-observatory-v1 |
| Lineage L and source_namespace | country-package-alderney |
| country_id / country_code / polity_kind | alderney / GG-ALD / territory |
| Proposed adapter version | atlas-alderney-field-map/1 |
| Method / schema | atlas-preserve-evidence/1 / atlas-master/1 |
| Approved tier path | schemas/atlas/tiers/alderney.json |
| Approved byte SHA-256 | e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7 |

Use `C(value)` exactly as current scripts/import/normalize.ts stable (also lib/atlas/identity.ts canonical): JSON.stringify with recursive object-key sorting by JS UTF-16 order, original array order, UTF-8, no BOM/indent/trailing newline. Preserve JavaScript escaping/number rendering and numeric-property JSON semantics; a non-JS implementation must match exact bytes. Reject duplicate JSON keys, undefined, nonfinite numbers/unpaired surrogates; never normalize Unicode/trim identities. Hash descriptors use strings/integer lengths, not fractional research values.

SHA(s) = full lowercase SHA-256 of UTF-8 s. Bridge `key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]`. New internal IDs use full digest. Compare complete identity tuples on collisions; fail rather than overwrite. Only attempt_id is random (`attempt-`+lowercase UUIDv4). Research IDs never use time, database rowid, attempt ID or R.

## Offices and geography

Copy O.Office ID exactly; office PK `(N,office_id)`. Two IDs only: GG-ALD-PLEB and GG-ALD-STATES. Seat counts are descriptions, not instructions to multiply offices. Country remains territory alderney, no invented Guernsey/UK parent row. T IDs equal O IDs, other→other, approved flags preserved without rewriting T.

Baseline geography G=`key("geo",["alderney",O.Jurisdiction,O.Office])`. Keep two bridge G bindings because office type participates even though both jurisdiction names are Alderney. Keep office source-code crosswalk and raw tuple. No name-based merging; future display corrections do not mint a geography; actual boundary replacement needs a reviewed identity binding. Parent/effective dates NULL, no geometry.

| Office | Exact bridge geography ID |
| --- | --- |
| GG-ALD-PLEB | geo-e421db320af0c5c106f24293 |
| GG-ALD-STATES | geo-5b23b4b4235736678bfe4b68 |

## Historical and prospective event identities

Identity-strict cellText: null/absent→empty string; string unchanged; finite number→JS String(number); other types fail. cellYear: integer number or trimmed exactly-four-digit string, else null; independently validate real year range. `year_part=decimal(cellYear(Year))` when nonnull, else exact nonempty cellText(Year), else literal undated.

Historical `HK=Office ID+"::"+year_part+"::"+cellText(Ballot date if recorded)`. `event_id=key("event",["alderney",HK])`. PK `(N,office_id,HK)`; public uniqueness `(N,event_id)`. D must match one H by this exact tuple; no office+year approximation. Six selected H rows only; CSV crosscheck adds no events.

For each actual O.Next polling date, preserve existing bridge `event_id=key("next",office_id)` and `HK=event_id`. Do not replace this public ID with a newly hashed date string. Both baseline office.next_history_key values equal their corresponding next ID. Date corrections preserve it; a genuinely separate later cycle requires a versioned explicit identity binding/sourced distinct event identity, never reusing one public ID for two elections. Review ambiguity before a future cycle can overwrite a current prospective record. This baseline has exactly two prospective events already represented by the bridge.

| Office | Exact HK | Public event_id | Role / certainty |
| --- | --- | --- | --- |
| GG-ALD-PLEB | GG-ALD-PLEB::2024::2024-12-07 | event-7fa40c8eb8a5b88a5a05ec45 | selected / unknown |
| GG-ALD-PLEB | GG-ALD-PLEB::2022::2022-12-10 | event-eec888d9838b64f289a1ad59 | selected / unknown |
| GG-ALD-PLEB | GG-ALD-PLEB::2020::2020-12-12 | event-79e05b5ff2039ec0e7058810 | selected / unknown |
| GG-ALD-STATES | GG-ALD-STATES::2025::2025-03-08 | event-1e4346e3f46e487f877780f8 | selected / unknown |
| GG-ALD-STATES | GG-ALD-STATES::2024::2024-11-16 | event-ecff7753d46fc4a6a17b6398 | selected / unknown |
| GG-ALD-STATES | GG-ALD-STATES::2023::2023-02-18 | event-af8620342d4afdb8a7f9b8db | selected / unknown |
| GG-ALD-PLEB | next-f2267589582f25eae0c65e96 | next-f2267589582f25eae0c65e96 | none / conditional |
| GG-ALD-STATES | next-166ad22fe0872fb2402d3f93 | next-166ad22fe0872fb2402d3f93 | none / conditional |

Historical corrected key-bearing date needs a documented identity_binding with old full PK/HK/event_id and incoming tuple. Preserve stored public identity and crosswalk new HK. Genuine replacement elections remain distinct; 2025 and 2023 States replacements are special events, not proceedings superseding the 2024 election. Do not infer identity solely from names or date proximity.

## Date identities and conditional proposals

`date_id="date-"+SHA(C([N,"event",event_id,"ballot"]))` for all eight events. The corresponding office.next_date_id reuses its prospective event's date_id; no duplicate office-owned date row. Eight owners→eight date rows. A date correction keeps owner ID; prior value remains auditable in old release/claim evidence.

Prospective date label comes from O; exact calendar match binds STATES→Cal /rows/0/4 (2026-11-21), PLEB→/rows/0/5 (2026-12-12). Both Cal /rows/0/6 and original briefing/README explain the unverified July proposal. precision=day, certainty=conditional, date_resolution=resolved. No range IDs, no runoff FK. Historical day precision retains certainty=unknown, not inherited conditional.

Future independent competing date claims: owner_type=date_claim; owner_id=C([record_key,override_path,change_id+"/"+claim_id]); slot=value. General date formula is date-+SHA(C([N,owner_type,owner_id,slot])). Range endpoint slots append /start and /end. Each unresolved claim gets its own row; withhold single event/office pointer with conflicting state. office.next_history_key must also be NULL while conflicting, although existing event remains addressable. Month/year labels never acquire a day; unknown dates are not confirmed in-window.

## Result row IDs and party context

Read single D /rows in physical order and group by exact HK without sorting candidates/votes. Baseline `result_row_id=event_id+"-r"+decimal(i)` where i starts at0 per event. All 27 belong to selected H; zero prospective rows. Two stable crosswalk bindings:

- Physical: namespace alderney:baseline-result-row, upstream_id=C([original_input_path,original_sheet,original_source_row]); entity_kind=result_row.
- Semantic: namespace alderney:result-identity, upstream_id=C([N,office_id,HK,Electoral unit,Candidate or list,Party or proposer]); exact source strings/nulls, exclude marks/share/seats. All 27 tuples are unique.

Refresh resolves semantic binding or explicit accepted identity override; physical row index cannot silently retarget another candidate. Corrected marks/reorder preserve IDs. New result identities for an existing event get indices above all ever assigned, multiple new tuples ordered by C(tuple); never recycle omitted indices. New events start r0 in incoming order. Ambiguous duplicate/renamed identities require explicit binding.

PLEB 2024 r0 is Edward Hill (321 marks), r1 Alex Snowdon (317); source spellings remain exact. Alexander Snowdon in earlier contests is not auto-merged with Alex Snowdon. Each result keeps party_namespace=`alderney/`+decimal cellYear(D.Year), or literal unknown if absent later. Original party label/code both copy supplied Independent; this does not create a single party entity, concordance or volatility group. No party_mapping/proceeding ID exists baseline.

## Sources and evidence identities

Canonical source key `(alderney,country-package-alderney,source_id)`. Catalogue source_id=`alderney--`+S.Source ID. Match exact catalogue token, then exact unique URL. Genuine unmatched inline URL→`alderney--`+key("url",URL). Baseline six catalogue sources plus one actual official-proposal URL; no invented source metadata. Preserve exact URL query/encoding, no normalization or domain collapsing.

For every URL, keep bridge alias `alderney--`+key("url",URL) to the canonical catalogue source when matched. Bare and prefixed catalogue IDs survive. Exact Source ID can resolve where duplicate URLs later exist; ambiguous URL-only match becomes explicit unresolved unless an existing accepted alias resolves it. Previously resolved missing stage row fails closed; never relabel unresolved. Source catalogue titles/URL years do not override event dates.

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
| Original office | alderney:office-register | Office ID → office |
| Bridge office/geography/event/result | observatory:alderney | exact bridge ID → matching entity |
| Original/accepted incoming HK | alderney:history-key | exact HK → event, including next IDs |
| Bare catalogue | alderney:source-catalogue | Source ID → source |
| Prefixed source/bridge URL alias | observatory:alderney | exact existing ID → canonical source |
| Exact URL | alderney:source-url | URL → source |
| Geography source-code | alderney:geography-office-code | Office ID → geography |
| Physical/semantic result binding | namespaces above | C(tuple) → result_row |
| Briefing | alderney:briefing | Office ID+.html → BF input locator |
| Country | observatory:alderney | alderney → country |

No poll/control aliases: no such records supplied. Release legacy alias is dataset_release.upstream_release_id=country-package-alderney, not a fictional record_locator target. BF contextual histories remain addressable by original artifact+heading locator; no fake public event IDs.

## Fingerprint and release identity

Exact descriptors and canonical bytes are in [Alderney_Input_Inventory.json](Alderney_Input_Inventory.json). Shape: canonicalization=atlas-c14n/1; hash_algorithm=sha256; lineage_id=L; inputs=[{input_path,input_kind,sha256,byte_count}]; overrides=[]; adapter_version=atlas-alderney-field-map/1; method_version=atlas-preserve-evidence/1; schema_version=atlas-master/1; schema_inputs=[{input_path,sha256}]. Arrays sorted by input_path in JS UTF-16 order; no duplicate paths across inputs/overrides.

Enumerate all20 actual git-tracked package regular files and approved T, not absent tables. *.html→artifact, T→tier_classification, remaining package→package. Verify16 manifest-listed hashes/lengths; hash four additional files normally. No self-hash recursion. Unexpected files/symlinks or unpinned dirty inputs fail. Accepted applicable overrides appear only in overrides, input_kind=override. Every retained_input has exactly one descriptor. Hash original bytes, never reserialized JSON. Shared archive/workbook are optional recovery metadata already in M, not extra other-country dependencies.

Schema logical filenames follow current runtime lib/atlas/identity.ts (physical prefix schemas/atlas/migrations/):

- `0001_atlas_attempt_log.sql`: `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
- `0002_atlas_master.sql`: `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`

`fingerprint=SHA(C(hash_inputs))`; `R=L+"--sha256-"+fingerprint`. Candidate documentation vector:

- Fingerprint `c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706`
- R `country-package-alderney--sha256-c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706`
- Isolated hash-only method_version=atlas-preserve-evidence/2 probe yields `5a406722c1c3ca597cf66a64cb7895c34b41652aab330c40f1917807a43b2baa`; this is not an approved method change or published research.

No SQLite load/publication occurred. A future implementation must adopt this mapping version or explicitly version semantic changes. Typed versions equal JSON values. Exclude attempt, timestamp, operator, absolute storage/recovery paths, git commit and unrelated lineage/publication set. New attempt→same R on identical effective inputs; changed package/tier/override/adapter/method/schema→new R. Same lineage/fingerprint cannot mint multiple immutable release IDs. Missing/failed candidates are attempt audit, not public releases.

## Overrides, refresh and publication

No Alderney override supplied or approved here. Future files under data/overrides/atlas/alderney/ use schema_version=atlas-override/1,lineage_id=L,changes[]. Each change requires change_id,target_table,full target_key,field (or identity_binding),expected_original,replacement,decision,reason,origin,claims[],supersedes_change_id,identity_binding. Origin includes exact input/hash/pointer; each claim has claim_id,source_id or real source_url,locator,value,certainty (null for non-date). Research claims require evidence; operational binding may have empty claims without inventing research. decision uses accepted/withhold/withdraw/supersede/identity_binding from contract; docs/test fixtures are not executable production approval.

Null expected_original is not wildcard. Reject absent keys, unmatched originals, wrong types/unsupported fields, duplicate IDs and competing unsuperseded changes. Topologically apply explicit supersedes dependencies then lexical input_path/change_id for independent changes; cycles fail. Date identity corrections preserve public IDs and both original/corrected claims. No silent party-name equivalence, date confirmation or extra ordinary-history import.

An incomplete incoming package cannot delete previous records. Carry actual prior omitted office/event/result/source/tier/locators/evidence/aliases with original bytes. Old/new same path collision→`inherited/sha256/<old_sha256>/<original_repo_relative_path>`; original path/hash remains raw, typed input/classification FK uses retained path. Include all carried input descriptors in effective fingerprint. Incoming and retained classification union must exactly cover effective office set with explicit resolution for conflicting overlap. Fresh first import cannot invent inherited rows.

New active Alderney rows point consistently to new R while raw retains original lineage release/locations; retain prior release metadata and full snapshot. Sourced withdrawal changes state/note but preserves addressable IDs. Upcoming ID must not be recycled for a different election cycle without a reviewed binding. Publication preserves all unrelated lineage release pairs/rows and record-owned citations. Durable attempt ledger outside staging; same-FS/WAL/fsync/atomic-rename/receipt recovery follows Field Map and checklist. No status approval, importer or VPS action is authorized by this documentation.
