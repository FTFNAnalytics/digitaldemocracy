# Austria identity rules

Prompt N draft; main contracts `6e6426fe17f6f542b58b68f8607124e007b852ff`, frozen PR #11 package `6b38848d76a815f7dd0bcae3d49a25e6dca9e1af`. No Austria package or public bridge IDs exist on the inspected main. Office IDs are actual source IDs; event/result/geography/source vectors are **proposed deterministic identities**, adopting the established Europe key contract. They are not invented research entities. No importer is written or executed. T remains draft SHA `9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d`; approval changes the input hash and candidate release.

## Constants and canonical encoding

| Constant | Value |
| --- | --- |
| N office/event namespace | cdd-observatory-v1 |
| L lineage and source namespace | country-package-austria |
| country_id / country_code / polity_kind | austria / AT / sovereign_country |
| Proposed adapter | atlas-austria-field-map/1 |
| Method / schema | atlas-preserve-evidence/1 / atlas-master/1 |
| T | schemas/atlas/tiers/austria.json |
| Draft T SHA | 9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d |

Use `C(value)` exactly as current scripts/import/normalize.ts stable (also lib/atlas/identity.ts canonical): JSON.stringify with recursive object-key sorting by JS UTF-16 order, original array order, UTF-8, no BOM/indent/trailing newline. Preserve JavaScript escaping/number rendering and numeric-property JSON semantics; a non-JS implementation must match exact bytes. Reject duplicate JSON keys, undefined, nonfinite numbers/unpaired surrogates; never normalize Unicode/trim identities. Hash descriptors use strings/integer lengths, not fractional research values.

SHA(s) = full lowercase SHA-256 of UTF-8 s. Bridge `key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]`. New internal IDs use full digest. Compare complete identity tuples on collisions; fail rather than overwrite. Only attempt_id is random (`attempt-`+lowercase UUIDv4). Research IDs never use time, database rowid, attempt ID or R.

## Office and geography identities

Office PK=(N,O.Office ID), exact source string.2038 IDs, including all four regional AT/AU IDs. Do not normalize AU to AT, split council electors into new offices or invent missing mayors. The1017 mayor rows are already supplied;1017 councils remain separate. T exact ID-set equality is mandatory. Classification remains pending Justin, independent of office existence.

G=key("geo",["austria",O.Jurisdiction,O.Office]);2038 distinct tuples and keys verified. These preserve the established office-type-specific Europe binding pattern; they are not a claim of 2038 distinct municipalities. Country/geography PK=(austria,G); parents/effective dates NULL. Do not merge by place name or infer state-parent IDs from office prefixes. Future display correction retains G through crosswalk. Sourced boundary replacement requires explicit binding; never sum predecessors.

## History and event identities

cellText: null→empty string, string unchanged, finite number→JS String(number); other types reject. cellYear: integer number or trimmed exactly-four-digit string; otherwise null, validate calendar year range separately. year_part=decimal cellYear when present; otherwise original nonempty text; otherwise literal undated.

H HK=`Jurisdiction ID+"::"+year_part+"::"+cellText(Actual ballot date, if recorded)`.
IX HK uses Office ID / Year / Ballot date if recorded. D uses H fields. All baseline date-key components are empty. event_id=key("event",["austria",HK]); PK=(N,office_id,HK), public uniqueness=(N,event_id). Full key includes namespace and office even though event_id also encodes them indirectly. No attempt/release in identity.

H 5944 is the detailed selected-history input; matching IX rows are reconciliation/provenance only. IX adds12 distinct selected events for four offices not in companion: AT-KTN-A, AT-NOE-A, AU-9560299fb9, AU-ab9fc7cefb. Total5956. Missing companion membership is not grounds to drop them. Selected means included in the research history, not complete/eligible/final;11 H rows carry Actual election return=false,12 Competition eligible=false. Preserve those flags and limitations. D 16336 attaches only to5944 H events; no source summary-to-result expansion for the other 12. BF/leader/runner narratives do not create additional events/results.

The precise day extracted from a supported Round / basis annotation changes the date projection only, **never HK**. Example AT-BG-10602-M::2022:: remains its2022-cycle identity despite actual repeat date3 September2023. The two Deutschkreutz2017-cycle repeats similarly retain2017 keys with 2018 actual dates. Do not reconstruct annulled predecessor events or auto-generate proceedings. No structured proceeding IDs/sequence are supplied.

All O.Next polling date cells are NULL; all J.Next date cells and Cal date endpoints are NULL. Baseline prospective events=0; office.next_date_id/next_history_key=NULL and resolution=unknown. Expected2027/2028 cohort prose is retained context only. If a future source supplies an office next date, use key("next",office_id), HK equal to that ID, as the Europe convention. Distinct subsequent cycles require an explicit versioned identity binding before reusing a prospective key would overwrite a different election.

On correction of key-bearing source fields, preserve existing public identity through accepted identity_binding, recording old full PK/HK/event_id plus incoming tuple and exact origin. New source HK aliases point to existing event; genuinely distinct elections remain separate. No name/date-proximity matching or random reassignment. A baseline exception requires review: AT-OOE-41119-M::2015:: binds companion first-ballot observations but index/HTML final yes/no claims. Preserve the existing source HK and all claims; no silent phase split or numeric replacement. Block publication until an accepted source-backed stage/identity override resolves it; see Field Map and inventory.reconciliation_holds. The four documentary result vectors remain provisional observations, not a resolved final return.

## Date identities and precision

Date ID=date-+SHA(C([N,"event",event_id,"ballot"])).5956 baseline date owners. Label/precision/components follow [Field Map Date policy](Austria_Field_Map.md#date-policy-and-cycle-identities): exact five-string allowlist supplies58 day labels; remaining5898 use source Year, month/day NULL. All certainty=unknown. Three repeat ballot years differ from cycle identity year; that is explicitly supported by annotation, not a reason to rewrite HK. Current null dedicated date cells remain raw. Unverified Eferding second-ballot day remains year-only.

A future complete YYYY-MM label keeps month precision; YYYY keeps year; never day1. Missing year/date requires an explicit unknown date row so event.date_id remains nonnull with resolution=unknown. Unknown office next date creates no fictitious event/date. Source-provided ranges use separately identified ordered, non-range endpoints (slot ballot/start and ballot/end), with no cycles. Window overlap must respect precision and uncertainty; unknown dates are not confirmed in-window.

Conflicting source claims have owner_type=date_claim, owner_id=C([record_key,override_path,change_id+"/"+claim_id]), slot=value; generic date ID=date-+SHA(C([N,owner_type,owner_id,slot])). Retain each claim/evidence locator; withhold single event/office date pointer with resolution=conflicting, and office.next_history_key=NULL. Existing event remains addressable. Corrections preserve owner IDs with prior claims/versions retained.

## Results and party context

Single D table /rows encounter order; group by exact HK without sorting. Baseline result_row_id=event_id+"-r"+zero-based per-event index.16336 distinct rows and unique semantic tuples. Results keep namespace/office/HK in all FKs; proceeding_id=NULL.

Two crosswalk bindings per result:

- austria:baseline-result-row → C([original_virtual_input_path,original_sheet,original_source_row]).
- austria:result-identity → C([N,office_id,HK,D.Party / list,D.Candidate / ticket,D.Election cycle key]).

Numbers are excluded from semantic identity. Future reorder/value corrections resolve prior semantic/accepted explicit binding first; never retarget an old r-index by new row position. New tuples for an existing event get monotonically unused indices beyond all assigned, multiple new tuples sorted by C(tuple); new events start r0 in incoming order. Omitted indices never recycled. Ambiguous renamed/duplicated labels need evidence-backed explicit identity binding.

candidate_or_list_label prefers supplied Candidate / ticket (5295), otherwise Party / list (11041); neither supplied→NULL in future. Party label/code both preserve exact Party / list under bridge-compatible combined field convention. party_namespace=austria/+source cycle cellYear(Year). No party-family equivalence, coalition split, inferred Independent, party_mapping, elected flag or substitute flag. votes/share/seats retain values with NULL→unknown,0→zero,positive→recorded. Result evidence_status=recorded does not assert full decisive/certified return; event limitations remain visible. Shares percent_0_100, no division/rounding/reconstruction.

## Source and evidence identities

Source PK=(austria,L,source_id). Catalogue source_id=austria--+exact Source ID. SM.Title/Source URL and SC.Title / dataset/URL normalize header names only; all 64 duplicate IDs have equal title/URL/grade/access metadata.93 canonical catalogue sources plus4 actual inline-only URLs=97; all canonical URLs unique. Preserve both origins for duplicates.

Exact token then exact unique URL resolution; supplied token+URL must agree. Genuine inline URL→austria--+key("url",exactURL), title/publisher/grade/access NULL unless actually supplied. Do not alter query/encoding or derive publisher from hostname. URL alias austria--+key("url",URL) points to catalogue when present. Catalogue ID metadata conflict or unresolved ambiguity fails for review, never last-wins. A known resolved source missing from staging is a broken FK; genuine unknown citation token retains unresolved_evidence with original occurrence, no fabricated source.

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

Occurrence tuple is `[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]` from field-map locator, excluding mutable SHA/R. `evidence_id="ev-"+SHA(C([record_key,[source_country_id,source_namespace,source_id],occurrence_tuple,claim_kind]))`. Multiple explicit claims append effective change_id/claim_id to occurrence tuple. `unresolved_id="unres-"+SHA(C([record_key,occurrence_tuple,original_token]))`. Prior bindings remain stable across location/value corrections; raw carries current physical location separately. Date annotation and original null ballot cell remain separate exact locators in claim_json; no prospective baseline claim.

## Alias namespaces

Crosswalk PK=(entity_kind,upstream_namespace,upstream_id); matching typed record_locator must exist, same entity kind. Contradictory alias target fails. No claim that these are already-public Austria bridge aliases.

| Alias family | Namespace | ID / target |
| --- | --- | --- |
| Original office | austria:office-register | exact O.Office ID → office |
| Proposed compatible office/G/event/result/country | observatory:austria | exact projected ID → matching typed entity |
| Source HK | austria:history-key | exact HK → event |
| Bare catalogue | austria:source-catalogue | Source ID → source |
| Prefixed catalogue/URL form | observatory:austria | exact generated source ID/alias → canonical source |
| URL | austria:source-url | exact URL → source |
| Geography source code | austria:geography-office-code | O.Office ID → geography |
| Physical /semantic result | names above | C(tuple) → result |
| Briefing | austria:briefing | office_id+.html → retained BF input |

Unstructured artifact sections remain addressable by input/hash/locator, not fabricated event/result IDs. No typed poll/control/metric alias because schema has no such destination in this contract; one poll retains input identity. Source lineage alias country-package-austria belongs to dataset_release.upstream_release_id, never invented record_locator release kind.

## Fingerprint and effective-input identity

[Austrian input inventory](Austria_Input_Inventory.json) supplies descriptors and canonical hash_inputs_json bytes. Object fields exactly: canonicalization=atlas-c14n/1; hash_algorithm=sha256; lineage_id=L; inputs=[{input_path,input_kind,sha256,byte_count}]; overrides=[]; adapter_version=atlas-austria-field-map/1; method_version=atlas-preserve-evidence/1; schema_version=atlas-master/1; schema_inputs=[{input_path,sha256}]. Sort arrays by logical input_path in JS UTF-16 order; no duplicate input/override paths. Exclude attempt/clock/operator/git commit/absolute scratch location/unrelated lineage/publication-set identity.

25 tracked outer files+2058 virtual payload members+T=2084 descriptors. P tracked names unchanged; V=P+unpacked/+exact tar member. Chunks and HTML=artifact, T=tier_classification, other members/package files=package. Original shared archive/XLSX checksums are metadata already retained in manifest/inventory, not additional effective inputs. Never add reconstructed combined XZ or temporary files as duplicate inputs. All bytes must be available in immutable content store; recovery_locator=sha256:<digest> plus commit/path or verified payload member provenance. It is not a temporary unpack path. inventory.json itself has one independent descriptor, no self-hash recursion.

Schema filenames are logical0001_atlas_attempt_log.sql and 0002_atlas_master.sql with hashes below (physical prefix schemas/atlas/migrations/):

- `0001_atlas_attempt_log.sql`: `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
- `0002_atlas_master.sql`: `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`

Fingerprint=SHA(C(hash_inputs)); R=L+"--sha256-"+fingerprint.

- Draft-only fingerprint: `85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005`
- Draft-only candidate R: `country-package-austria--sha256-85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005`

**Not publishable:** this vector deliberately hashes current draft T. Approval changes T bytes and must change R; do not claim this candidate is the future approved release. Once approved, identical effective inputs always give same R and each invocation gets a new attempt UUID. Any package/tier/accepted override/adapter/method/schema change changes R. Failed attempts remain audit only. Hash vectors do not write SQLite or mint releases.

## Overrides, incomplete refresh and coexistence

Future applicable overrides under data/overrides/atlas/austria/ follow governing atlas-override/1: lineage_id=L; change_id; target_table; full target_key; field/identity_binding; expected_original; replacement; decision; reason; origin; claims[]; supersedes_change_id if supplied. Exact type/value guards, null is not wildcard. Research replacements require evidence locators; operational identity-only binding may have empty research claims. Unknown field/type, competing unsuperseded changes, duplicate IDs, wrong original or supersession cycle fail. Explicit topological supersession then lexical input_path/change_id; never silent last-wins. Preserve losing/original claims. No Austria override is approved here.

Incomplete incoming snapshot is not deletion. Retain omitted existing office/event/result/source/tier/evidence/alias rows with original provenance and bytes, include them in effective fingerprint. If new content reuses old logical path, retained old file gets inherited/sha256/<oldhash>/<original_input_path>; original source path/hash remain raw, typed retained-input/classification FKs use inherited path. Effective classifications must cover effective offices without unreviewed conflicts. Initial import cannot invent inherited rows. Withdrawals/boundary replacements require accepted explicit decisions, not absence or a prose watch.

All active Austria rows join their own (L,R). The publication is the complete lineage-release set; Europe refresh does not alter LatAm/NZ/other-Europe rows or citations. Readers never cite latest receipt as record release. Separate durable attempt ledger +same-filesystem staging/consistent backup/WAL checkpoint/fsync/atomic rename/receipt recovery follow Field Map. Last good publication remains serving on failure. No importer, SQLite, publication, VPS or UI run in this pack.
