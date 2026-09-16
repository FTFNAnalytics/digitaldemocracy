# Continuity identity rules — Latin America and New Zealand

Phase 2 / cutover-gate mapping contract v1. Governing main: `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`; the accepted plan keeps Europe as Atlas landing and requires one SQLite publication set after cutover. Refer to the two field maps for the requested-path availability caveat: the saved Prompt B DDL governs this document; the requested migrations/docs have not yet landed on this main. No importer, schema change, row load, route or UI is supplied. Albania mappings remain untouched.

## Namespaces and ownership

| Identity scope | Exact rule |
| --- | --- |
| LatAm lineage L | **latin-america-fe5e91689def**; never replace with latin-america, Europe or a new archive-derived lineage on refresh |
| NZ lineage L | **country-package-new-zealand** |
| Office/event/proceeding/result namespace N | **cdd-observatory-v1**, matching the Albania contract's existing observatory identity space |
| Source namespace | Exact owning L; source PK also includes country_id |
| Country/geography | Existing country slug; geography PK=(country_id, geography_id) |
| Public IDs | Existing exact strings retained inside their typed ID columns; namespaces are storage scopes, not public renaming |
| Random identity | Only operational attempt_id=`attempt-` + lowercase UUIDv4 |

Preflight all existing public IDs for collisions. LatAm has 18,643 unique office IDs,58,658 unique event IDs and 12,254 unique existing source IDs; country/office/event/source/proceeding ID duplication checks passed within the derivative. If a future lineage collides with another owner in this namespace, fail and require an explicit reviewed identity crosswalk. Never silently transfer an office/country/source to the last-imported lineage. Country PK is global under unchanged DDL; the present LatAm and NZ country sets do not overlap Europe. Shared-country future ownership is an explicit integration decision, not a last-writer-wins rule.

## Canonical bytes and internal key functions

`C(value)` is the existing bridge's compact stable JSON: recursively sort object keys in JavaScript UTF-16 code-unit order, preserve array order, serialize with JSON.stringify escaping/number rendering, UTF-8, no BOM/indent/trailing newline. No trimming or Unicode normalization. Reject duplicate JSON object keys, nonfinite numbers, undefined and unpaired surrogates. Hash descriptors use strings and integer byte counts; another implementation must reproduce bytes, not merely an equivalent parsed object.

`SHA(s)` is lowercase full 64-hex SHA-256 of UTF-8 text s. Existing bridge `key(prefix,value)=prefix+"-"+SHA(C(value))[0:24]`. Existing ID values are copied, not regenerated. Truncated bridge formulas below are reconciliation rules only. For every newly derived internal key compare the full unhashed tuple to detect collision; do not overwrite. Internal keys exclude release IDs, mutable numeric claims and operational timestamps.

## Latin America office and event identities

**Use committed derivatives as the identity authority:** M=data/research/manifest.json; B0=decoded base.json.gz; country shards=the exact M.countryFiles list. Load arrays once; never combine original Data/*.json as a second record stream. Original archive objects reconcile and retain evidence. Every shard's repeated release object must agree with M.release; it is metadata, not another lineage row.

| Destination | Exact source identity / scope |
| --- | --- |
| country.country_id | C.id, including all 15 base status-only records |
| geography.geography_id | G.id unchanged; names/source codes/raw supplied separately |
| office.office_id | O.id unchanged; (N, O.id) is PK |
| election_event.history_key | E.historyKey unchanged; historical key equals original histories[]._key |
| election_event.event_id | E.id unchanged, including all next-* IDs |
| proceeding.proceeding_id | Q.id unchanged, resolved via Q.eventId to full (N, office, HK) |
| result_row.result_row_id | V.id unchanged within existing event; never reassign -rN on sorting |
| result_row.party_namespace | V.partyNamespace unchanged, including country/source/year |
| source.source_id | S.id unchanged, preserving country--prefix and token/URL-hash suffix |

Historical event check: E.id=key("event",[country_id, raw_history._key]). Prospective check: E.id=key("next", O.id); its HK is that same next ID. Historical raw `_key` contains opaque country-specific cycle/round/ordinal strings—do not split/reformat/rebuild it. Original raw `.event_id`, when supplied, may differ from public E.id: preserve it as an alias in namespace `latam:<country_id>:<office_id>:raw-event`, not as a replacement public event ID.

Geography legacy check is key("geo",[country_id, raw_office.region, raw_office.name]), but G.id is copied. Historical result check is E.id+"-r"+zero-based original raw parties-array index. These checks do **not** authorize regenerating IDs on corrected or reordered input. Persist the original event/result/row binding and compare it before accepting refreshes.

**History-role reconciliation is mandatory:** 58,658 events =36,750 selected+3,759 other+18,149 none/prospective. Legacy manifest.validatedCounts.histories=40,509 counts selected+other. Do not rewrite roles to fit the Phase 0 label, drop other histories or discard unparsed upcoming dates. This includes historical/predecessor offices: 18,229 current+414 historical=18,643 office IDs.

Concrete preserved record: `BR-AC-G`→`geo-82700fc3c12b9db31e7a8160`; next event `next-8aebd96d89e6fa91d0dbe918`; selected history key `BR-AC-G|2022|Decisive governor round 1|0`→public `event-c77551f2d6bc78463fa4fe31`; proceeding `proceeding-f35505e804bddaec606057c0`. No part is replaced by an Atlas hash.

## New Zealand office, geography and event identities

J=data/countries/new-zealand/dataset.json. Public office_id is races[].id (the bridge already uses the race ID as office identity). Do not strip the year, merge it with another ward's office, split a six-member historical election into six offices, or use a candidate ID as office ID.

- Geography: existing key("geo",["new-zealand", race.authority, race.district]); preserve binding after first load.
- Prospective public event_id and history_key: existing key("next", race.id).
- Historical public event_id and history_key: exact histories[].id; office_id=histories[].related_race_id.
- Historical result_row_id: exact histories[].results[].id, not a newly computed ordinal.
- Source ID: `new-zealand--`+sources[].id; source namespace=country-package-new-zealand.
- Party namespace: `new-zealand/`+history.id, matching bridge; no cross-cycle person/party equivalence from similar labels.

| Office ID | Existing prospective event ID / HK | Existing geography ID |
| --- | --- | --- |
| NZ-BULLER-WESTPORT-2026 | next-154f7bfa6ea99d09c5a47d7c | geo-96ca6edad1e6879e7f9a5542 |
| NZ-CLUTHA-LAWRENCE-TUAPEKA-2026 | next-c0501510404853fce830e425 | geo-56a73f3f7a19de9864ebad10 |
| NZ-PORIRUA-ONEPOTO-2026 | next-6d6d16aaaf87ca0b6162a02f | geo-8b7c3905ca496f374f23806a |
| NZ-WELLINGTON-TAKAPU-NORTHERN-2026 | next-4fbed08ae3bd37dc52c92467 | geo-e77ef014d771b07d3b5841ac |

Historical IDs, unchanged:

- NZ-BULLER-WESTPORT-2025 → office NZ-BULLER-WESTPORT-2026 (17 result rows).
- NZ-BULLER-WESTPORT-2022 → same office (12 provisional-mirror result rows).
- NZ-CLUTHA-LAWRENCE-TUAPEKA-2025 → office NZ-CLUTHA-LAWRENCE-TUAPEKA-2026 (7 result rows).

The 11 `races[].candidates[].id` strings remain addressable retained input aliases; they are not result_row IDs. Canonical source IDs include `new-zealand--NZ-S01` through `new-zealand--NZ-S12`; preserve corresponding bare NZ-Snn tokens in crosswalks. No original NZ HTML briefings are supplied; do not fabricate an original-artifact target.

## Refresh bindings

LatAm copied derivative IDs and NZ supplied IDs are authoritative. Maintain crosswalks from public IDs plus original raw-row identities; reject reusing a result ID for another candidate/list or event. If a corrected raw input changes an identity-bearing label/key, require a documented `identity_binding` override naming old full PK and incoming full key. Correcting votes at the same real row does not change result_row_id. A genuinely new event is a separate sourced record; a corrected date is not automatically a new event.

For LatAm raw result rebinding, first use existing derivative V.id and confirm its parent E.id/HK. Where a future raw rebuild reorders parties or otherwise changes bridge-generated IDs, match only a unique original semantic tuple `[N,office_id,HK,raw.party_code??raw.party_id??null,raw.candidate??null,raw.party??raw.party_label??null]`, excluding vote/share/seat values; preserve original source-row locator as an additional binding. Ambiguous/duplicate tuples or label changes require an explicit binding override. Do not allocate a previously used -rN to a new candidate. New rows of an existing event use the next never-used ordinal; multiple new rows sorted by C(full supplied identity tuple). New event original order is frozen on first acceptance. An importer must not regenerate the frozen baseline as a prerequisite to continuity.

For NZ, supplied candidate result IDs are already explicit. Similar names across 2022/2025/2026 are not person-identity links. Preserve current office ID and its geography binding on display spelling corrections. No supplied proceeding or party-mapping IDs exist for NZ; do not invent them.

## Internal locators and dates

`record_key="rec-"+SHA(C([entity_kind,...target_components]))`:

| Kind | Ordered target components |
| --- | --- |
| country | [country_id] |
| geography | [country_id, geography_id] |
| office | [N, office_id] |
| event | [N, office_id, history_key] |
| proceeding | [N, office_id, history_key, proceeding_id] |
| result_row | [N, office_id, history_key, result_row_id] |
| party_mapping | [country_id, party_namespace, mapping_id], none baseline |
| source | [country_id, L, source_id] |
| input | [L, input_path], excludes R |

Use the exact nonnull target shape enforced by record_locator; unused columns NULL. Each input locator's typed FK still includes current (L, R, path). Ancillary IDs can share an input locator: crosswalk.raw_json must preserve original entity kind and exact JSON pointer. This gives addressability without pretending an input is an office, result or source.

`date_id="date-"+SHA(C([N,owner_type,owner_id,slot]))`. Event: owner_type=event, owner_id=event_id, slot=ballot. Office next: owner_type=office, owner_id=office_id, slot=next. Preserve both supplied labels where office/event labels differ (NZ time suffix), validating shared components. Distinct unresolved claims use owner_type=date_claim, owner_id=C([record_key, override_path, change_id, claim_id]), slot=value. Range endpoints append /start and /end; they must be known non-range values and acyclic. No baseline event ranges are supplied by either lineage.

LatAm dates copy normalized components/precision/certainty exactly, including unknown narrative labels. NZ uses declared date_precision and the actual ISO components, validates Gregorian day/month/year, and retains close_time_local/time_zone separately in raw. Actual four prospective dates are day precision; missing time stays missing. Future month/year labels retain missing components; invalid supplied dates fail, not degrade to year. No day 1, midnight or noon fallback. Historical NZ certainty stays unknown; prospective stays expected under existing bridge semantics.

Evidence ID=`ev-`+SHA(C([record_key,[source_country_id, L, source_id], occurrence, claim_kind])). Unresolved ID=`unres-`+SHA(C([record_key, occurrence, original_token])). Occurrence=[original input path, original owning record ID, field name, reference index], with explicit claim_id appended for multiple claims at one occurrence. Corrected value at same bound occurrence keeps its ID; another claim has a separate ID. Origin metadata carries current physical pointer/hash, not the stable identity tuple. Retain old row versions in full release snapshots.

## Source identity and raw-evidence boundary

LatAm's12,254 S.id values are existing public source identities. Keep them even where one URL has several catalogue/URL-form aliases. Do not apply Albania's catalogue-dedup policy here: it would unnecessarily change this lineage's public source identity set. Every S.url is supplied in the derivative. Resolve its original metadata through raw country `.sources` by exact `id || source_id`, after removing only the exact known `<country_id>--` prefix. URL-form aliases without a raw catalogue record remain real supplied URL sources, with missing metadata NULL.

Original raw catalogue sources have no publisher field; the bridge's country-name publisher is an adapter default. Keep that normalized object raw but store typed publisher=NULL. S.title is accepted as typed title only if it equals an actually supplied title in its matched catalogue record; otherwise URL-as-title or synthesized poll display-title defaults remain raw and typed title is NULL. Original catalogue grade/quality/type is retained separately as evidence_grade.

One actual duplicate raw catalogue key is `argentina--Se87b7cc01560`: two raw entries share URL/hash/check date but have Jujuy/Catamarca title variants. Preserve the existing derivative's chosen title only if it matches one raw variant, record both source-row origins and both titles as aliases in raw; do not mint a second source, pick a new winner, or silently lose the other title. If future URL/hash/value variants genuinely conflict, preserve both with provenance and withhold the conflicted optional value pending a documented override; do not retarget the source ID.

Status-only C records contain26 explicit country-scoped URLs not projected as S rows:23 screen.sources[] plus 3 territory `.source` URLs. Create their source IDs with the **existing** country--key("url", exact URL) rule, copy supplied titles/source_type where present; absent publisher/check date/hash remains NULL. Each has a country screening evidence link. This adds no research beyond already-retained source claims. Typed source count for the specified baseline traversal is 12,280. No country or office is added for those URLs.

Projected typed references are the normalized sourceIds arrays, status-screen sources just described, and NZ explicit source_ids/inheritance. Keep **all** additional opaque raw source fields/URLs in retained_input and raw envelopes; do not run a text-wide citation/URL scraper or turn every occurrence into a new source. Where the implementation explicitly promotes an additional raw citation, that is a reviewed method/inventory change: exact catalogue/URL resolution, source scope, unmatched-token behavior and new counts must be documented. This v1 continuity contract preserves the currently public references and lossless remaining evidence without guessing their semantics.

NZ sources provide publisher/title/check date/review status themselves: copy them. Historical V rows intentionally inherit H.source_ids (the J.conventions.source_inheritance rule); missing per-result source_ids is not a broken FK. Prospective candidates have their own source_ids and remain input observations. Empty candidate arrays are uncollected/not-final states, never automatically uncontested.

All currently projected LatAm and NZ source references must resolve. A deliberately dropped known source is fatal, not unresolved. A genuinely unmatched token from a later accepted citation input becomes unresolved_evidence with original token/locator/reason and no fabricated source. Legacy source public IDs remain discoverable through source locators and crosswalks; an unresolved token is not a dangling source FK.

## Crosswalk families and retained-only public identities

| Existing identity | entity_kind / upstream_namespace | Target |
| --- | --- | --- |
| Office/event/result/geography/proceeding/source public ID | Corresponding kind; `observatory:<country_id>` | Exact canonical typed locator |
| Raw LatAm office ID | office; `latam:<country_id>:office` | Existing office |
| Original histories[]._key | event; `latam:<country_id>:history-key` | Existing event |
| Raw history.event_id where supplied | event; `latam:<country_id>:<office_id>:raw-event` | Same existing event; ambiguous aliases fail |
| Raw source catalogue ID | source; `latam:<country_id>:source-catalogue` | Existing prefixed source |
| Bare NZ source ID | source; `new-zealand:source-catalogue` | Existing prefixed source |
| NZ raw race ID | office; `new-zealand:race` | Existing office; its prospective event has its own public next ID |
| NZ raw history ID | event; `new-zealand:history` | Historical event |
| NZ result ID | result_row; `new-zealand:historical-result` | Historical result |
| LatAm original briefing path in LL | input; `latam:original-briefing-path` | Original member retained_input; raw includes office_id and cleaned-BF pointer |
| Existing artifact.id | input; `observatory:latam:artifact` | ZIP/member retained_input, with original availability/path preserved raw |
| LatAm poll/register/officeholder/metric/issue/queue ID | input; `observatory:latam:<original collection name>` | Owning decoded shard/base retained_input, exact array pointer in raw |
| NZ prospective candidate.id | input; `observatory:new-zealand:candidate` | J retained_input, exact race/candidate pointer and office/event IDs in raw |
| NZ existing bridge issue / queue / metric ID | input; `observatory:new-zealand:<original collection name>` | J retained_input, exact source gap/metric pointer; values not recomputed |

NZ existing bridge issue ID=key("issue",["new-zealand", gap.task, gap.race_id]); queue ID=key("queue",[gap.race_id, gap.task]) only if that race exists; existing metric ID=key("ci", race.id). Preserve these as input aliases only. LatAm ancillary IDs are copied from arrays, never reconstructed from current claims. For original-briefing office route, resolve office ID through LL reverse mapping (must be one-to-one), not a filename guess; sanitized BF map is a distinct retained rendering derivative.

Release aliases are **not** record_locator entity kinds; preserve them in dataset_release metadata as below. Region records/default-landing flags have no typed table in Prompt B: keep the full B0.regions array as retained input with input aliases if needed. It must not override the accepted Europe landing configuration. No synthetic countries/offices are created for legacy region entries.

## Fingerprint inventory and versions

Same canonical structure as Albania, scoped to the continuity L:

- canonicalization=`atlas-c14n/1`; hash_algorithm=`sha256`; lineage_id=L.
- inputs: descriptors `{input_path,input_kind,sha256,byte_count}`, sorted by exact logical input_path in UTF-16 order.
- overrides: same descriptors for applicable documented `data/overrides/atlas/<lineage_id>/` files, sorted path; explicitly[] initially. Never duplicate them in inputs.
- adapter_version=`atlas-latam-continuity/1` or `atlas-nz-continuity/1`.
- method_version=`atlas-preserve-evidence/1`; schema_version=`atlas-master/1`.
- schema_inputs: sorted `{input_path,sha256}` for the actual accepted `schemas/atlas/migrations/0001_atlas_attempt_log.sql` and `0002_atlas_master.sql`. Their requested paths are missing now; verify the saved unchanged contract before implementation. No fake checksum for an absent file.

Hash `C(object)` once; fingerprint=full digest. New Atlas R=`L+"--sha256-"+fingerprint`. Reuse an already-published same-L/same-fingerprint release rather than mint a second ID. Every retained_input descriptor is included exactly once; DDL descriptors are schema metadata, not research retained_input rows. Do not include another lineage's files, publication set, global commit, receipt, operator, wall-clock time, absolute recovery location or SQLite file bytes. A changed adapter/method/schema version changes the targeted lineage fingerprint; it does not automatically rewrite untouched lineages on a single-lineage import.

**LatAm exact inventory:** all 141 tracked files under data/research (manifest, base, legacy-links,21 country shards,21 briefing shards,96 objects); original ZIP at logical `archive/<L>/Latin_America_Races_and_Briefings.zip`; all 18,767 M.inventory file members at `archive/<L>/<exact original entry>`; and 21 accepted tier files. With no overrides/inherited inputs this is **18,930 retained descriptors**. Archive/member descriptors are intentional separate byte objects, not duplicate office/event rows. File extensions JSON/CSV/MD/TXT are package; HTML and binaries are artifact; briefing/*.json.gz is artifact; other tracked derivative files including objects/*.gz are package. For a decoded gzip object, payload_json is populated only if its original content is valid JSON; CSV/HTML remains non-JSON with immutable bytes retained. Avoid any filename collision with the container descriptor; fail if inventory ever contains an identically named ZIP member.

**NZ exact inventory:** three tracked package files dataset.json, README.md, validate.mjs plus one accepted tier file: **4 descriptors**, absent overrides/inherited inputs. All three package files are package; T is tier_classification. Ingestion never executes package code or briefing HTML. The read-only package validator was run separately for this documentation verification.

Checksum rules: M.countryFiles/briefingFiles/baseSha256/legacyLinksSha256 refer to compressed or exact tracked bytes as specified. objects/<digest>.gz filenames refer to **decompressed** original bytes; retained_input.sha256 still hashes the compressed file. Original member hashes/bytes come from M.inventory and are verified against recovered ZIP. The ZIP itself is verified against M.packageSha256. Retain original and sanitized briefings separately; sanitization does not preserve original hash.

Because reviewed tier files and requested migration paths are missing, and 67 existing Mexico percentage values violate the unchanged DDL, there is **no valid production continuity fingerprint/release claimed by these docs**. The [LatAm exception inventory](Continuity_LatAm_Field_Map.md#share-domain-compatibility-blocker) gives every exact row; a reviewed share-domain override is an additional LatAm prerequisite, not permission to silently coerce source data. Import must log a durable failed preflight attempt rather than pretend to hash missing tiers as empty bytes. These are implementation prerequisites, not approval requests or new research tasks.

## Legacy release alias and current citation rules

The reserved L values never change. For every Atlas release retain the actual upstream alias in dataset_release.upstream_release_id and the full original release object/raw manifest. The first successful Atlas adoption also stores immutable operational `raw_json.legacy_alias_binding={alias:L,target_release_id:R0}`; subsequent corrected releases carry that upstream alias but do not create another legacy_alias_binding. CI enforces exactly one binding per `(L,alias)` and verifies its target is that immutable first release. This uses existing raw_json, not a new table or a mutable alias hidden in application defaults.

This distinction is necessary: several Atlas method/schema projections can derive from the same frozen upstream ZIP alias. A lookup on upstream_release_id alone may return multiple releases. The old explicit release citation resolves through the pinned first binding and recoverable source snapshot; current record pages use the record's own selected release R. Never silently reinterpret an old citation as whichever lineage was imported last. If a prior deployed master already has a reviewed legacy binding or identical validated release, preserve it; conflicting rebinding fails.

For a record page the citation join is:

```sql
SELECT o.office_id, o.lineage_id, o.release_id, r.research_snapshot_label
FROM office AS o
JOIN publication_release AS p
  ON p.lineage_id=o.lineage_id AND p.release_id=o.release_id
JOIN dataset_release AS r
  ON r.lineage_id=o.lineage_id AND r.release_id=o.release_id
WHERE o.id_namespace='cdd-observatory-v1' AND o.office_id='BR-AC-G';
```

This is a read-only specification query, not importer/application code. It must return the LatAm pair. Do not join publication_receipt, choose MAX(created_at), use the most recent attempt's release, or read a process-global dataset.release as citation authority. Source citations resolve their source/target provenance; they do not inherit Europe merely because that lineage last swapped the SQLite file.

## Multi-lineage publication protocol

The unchanged receipt/ledger DDL describes **one target lineage per attempt and swap**. Therefore implement multi-lineage ingest as serial single-lineage publications under the same writer protocol. A coordinator may invoke Albania/LatAm/NZ sequentially, but cannot claim the entire batch is one atomic publication using the single receipt. Every intermediate publication remains a complete valid set. Cutover requires all named members after their successful attempts; if a later member fails, no cutover and earlier valid publication remains served. A future true atomic multi-lineage batch would need a separately reviewed receipt contract; it is not invented here.

For a Europe-only re-import:

1. Commit a new Europe started attempt in the independent durable ledger.
2. Consistently back up the current master into same-filesystem staging; preserve all other selected lineage pairs and rows.
3. Stage only the targeted Europe's lineage projection and selection. LatAm/NZ dataset_release rows, active rows, retained inputs, date/evidence/crosswalk rows and original lineage IDs stay byte/semantically unchanged.
4. Validate all namespaces/FKs/tiers/counts, full set coexistence, and unrelated-lineage semantic hashes; write the Europe publication receipt in staging.
5. Off-VPS backup; checkpoint staging WAL with no busy frames; close connections; handle reader/sidecar lifecycle safely; fsync staged file; atomic rename; fsync directory; reopen read-only readers.
6. Finalize Europe attempt succeeded. Failure before swap leaves whole prior set serving; ambiguous post-swap crash is reconciled against receipt/set before assigning terminal state.

A publication with A0, L0, N0 becomes A1, L0, N0. LatAm `BR-AC-G.release_id` remains L0, its citation remains L0, and its source/FK/briefing targets are unchanged. Operational receipt changes; the physical DB hash need not stay identical. Unchanged LatAm re-import creates a new LatAm attempt/receipt but reuses L0. Poisoned NZ ingest does not publish a target subset or erase Europe/LatAm.

**Semantic comparison:** for each unchanged lineage compare dataset_lineage and its full immutable release rows, plus every row in every active table with that lineage_id, including retained_input, payload JSON, dates, evidence, locators and crosswalks; canonical column-name/value objects sorted by table then full PK, retaining SQLite scalar types. Compare publication_release pair separately. Exclude only publication_receipt and independent ledger operational rows, which describe the swap. No hidden updated_at field exists in these tables. Do not demand identical SQLite page bytes after successful unrelated publication.

## Incomplete refresh, overrides and conflicts

Keep omitted records because these inputs are incomplete. Active-row provenance points to the new target R, while original raw origin hashes/old release references remain. Include inherited source bytes in effective hash inputs; on path collision retain old bytes at `inherited/sha256/<old_sha>/<original_logical_path>` and point the typed retained-input FK there. All affected target-lineage active rows move coherently; no unrelated lineage is repointed. Retain original aliases/public IDs even on explicit withdrawal; historical office status is not withdrawal.

Overrides use the Albania contract's reviewed change structure: schema_version=atlas-override/1, lineage_id=L, changes[] with change_id, target_table, full target_key, field, expected_original, replacement, decision, reason, origin, claims[], supersedes_change_id, identity_binding. Each claim carries claim_id, source_id or source_url, locator, value, certainty. Research changes require actual evidence; operational binding-only changes may have empty claims. Reject conflicting unsuperseded accepted changes, unknown target fields, missing expected_original or mismatched PKs. Apply explicit supersedes graph topologically then lexical path/change_id for independent changes. No frozen byte edits.

Package wins absent documented override. If neither sourced claim wins, retain both dated claims and set single resolved date pointer NULL with conflicting resolution; keep the event ID. Numeric conflicts withhold the single numeric value, retain claim provenance and disputed evidence status; no derived metric is computed. Do not turn separate events or conflicting dates into a range. No automatically inferred proceedings or party successor mappings.

## Phase boundaries and cutover

**Phase 1 remains Albania-only.** This task neither loads nor authorizes loading LatAm/NZ into the Phase 1 proof, changes Albania tier rules, or implements UI.

**Phase 2 must bring both continuity lineages into SQLite before cutover:** all LatAm country/office/event/result/proceeding/source identities plus retained ancillary/briefing records; all NZ offices and seven events,36 historical results,11 retained prospective candidates and 12 sources. No status-only dummy office, no filtering to European or regional rows during storage. Reviewed tier prerequisites must be satisfied; zero regional count is allowed. Armenia remains last among early European targets and is outside this map.

Cutover also needs harvested real old-URL destination checks, working record/original-briefing/country/explorer destinations, release-citation parity, backups/recovery evidence and one post-cutover SQLite data plane. These maps define data compatibility only; they do not implement redirects or make destinations exist. Legacy B0.regions.isDefaultLanding may name South America; it remains retained source context and **must not displace Europe** as Atlas default. No tightness/competition table, metric recomputation, national-to-local forecast, geometry or launch expansion.
