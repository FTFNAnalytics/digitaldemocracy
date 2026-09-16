# Andorra identity rules

Documentation contract for [Andorra_Field_Map.md](Andorra_Field_Map.md), pinned `bc1d1a9b1c437ca0da309e3820967d4e29ff919d`. Preserve the existing Europe bridge public identities. This proposed Andorra mapping version uses the current Atlas canonicalization and schema filenames from `lib/atlas/identity.ts`; it does not invoke the Albania importer with another country or change its constants. No importer is supplied.

## Constants and encoding

| Symbol | Exact value |
| --- | --- |
| N / office and event namespace | cdd-observatory-v1 |
| L / source namespace | country-package-andorra |
| Country | andorra |
| Adapter version proposed by this map | atlas-andorra-field-map/1 |
| Method version | atlas-preserve-evidence/1 |
| Schema version | atlas-master/1 |
| Tier path | schemas/atlas/tiers/andorra.json |
| Tier status / SHA-256 | approved / b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014 |

C(v) is compact canonical JSON from the pinned bridge stable function: recursively sort object keys by JavaScript UTF-16 code-unit order, retain array order, JSON.stringify escaping/number rendering, UTF-8, no BOM/indentation/trailing newline. Reject duplicate keys, undefined, nonfinite numbers and unpaired surrogates. No Unicode normalization or string trimming. Hash descriptors use ASCII keys, integer byte counts and strings. Cross-language implementations must match bytes.

SHA(s) is lowercase full SHA-256 of UTF-8 s. `key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]`; new internal keys use full digest. Compare complete original tuples on collisions; fail instead of overwrite. Only `attempt_id = "attempt-" + lowercase UUIDv4` is random. No research ID uses rowid/time/attempt/release digest.

## Offices and geographies

`office_id=O.Office ID` exactly. PK `(N,office_id)`, country andorra. Approved T IDs must exactly equal all seven register IDs. No added council/consul office. Baseline G=`key("geo",["andorra",O.Jurisdiction,O.Office])`, preserving bridge office-type scope. Preserve office source-code alias and original tuple; later spelling correction must not mint a geography. Parents/effective dates remain NULL; no geometry.

| Office ID | Geography ID | Jurisdiction |
| --- | --- | --- |
| AD-M-05 | geo-59eee2ef1a3df387bf66a0f6 | Andorra la Vella |
| AD-M-01 | geo-36b8dc9620cf766f48db2bee | Canillo |
| AD-M-02 | geo-77f9d074222def8cfec4d3db | Encamp |
| AD-M-07 | geo-0c64b49ec3938c508ee9c4d1 | Escaldes-Engordany |
| AD-M-04 | geo-0f76b2e75af4d0f456bdd5a6 | La Massana |
| AD-M-03 | geo-e5bb0b1b7b64d5b72362a1f6 | Ordino |
| AD-M-06 | geo-0b914f9f4a92b2a6a7e1f876 | Sant Julià de Lòria |

## Histories and public event IDs

Identity-strict cellText: null/absent→empty string, string unchanged, finite number→JavaScript String(number), other types fail. cellYear accepts integer number or a trimmed string of exactly four digits, otherwise null; validate actual year in 1..9999 independently.

`year_part=decimal(cellYear(Year))` if nonnull, otherwise exact cellText(Year) if nonempty, otherwise undated. `HK=Office ID+"::"+year_part+"::"+cellText(Ballot date if recorded)`. `event_id=key("event",["andorra",HK])`. Event PK `(N,office_id,HK)`; public unique key `(N,event_id)`. All result/proceeding FKs carry N, office_id and HK.

H is a single authoritative selected-history table. D uses the same HK formula; require exactly one matching H. Never substitute the year-only research_date label into the empty date part of HK: `AD-M-05::2019::` has a trailing `::`. Do not match by nearest date/year. Crosscheck adds zero events. Each office has exactly three histories. All 21 event/hash vectors and all 53 result bindings are in [Andorra_Identity_Vectors.json](Andorra_Identity_Vectors.json).

| Exact HK | event_id | Date precision |
| --- | --- | --- |
| AD-M-05::2023::2023-12-17 | event-321b029bb122c1284e83dd89 | day |
| AD-M-05::2019:: | event-02706181e65e03e35a10c899 | year |
| AD-M-05::2015:: | event-aa8c0308dc1f11c4b2845eb1 | year |

A corrected key-bearing date requires an explicit identity binding naming old full PK/HK/event_id and incoming tuple. Preserve public event_id and stored HK, crosswalk incoming HK; date_id stays bound to the event. A genuine new election is distinct. Ambiguous correction vs new election fails for review. No baseline next event is supplied; all office next_history_key/next_date_id stay NULL. No key("next",office_id) is minted from late-2027 narrative. If a later input already has a public next event, preserve that public identity with reviewed source/date binding.

## Result rows

Read single D /rows in physical order; group by exact HK preserving encounter order. `result_row_id=event_id+"-r"+decimal(i)` where i starts at zero per group. Never sort by votes/name before assigning. Freeze baseline indices; retain two crosswalks:

- Physical: entity_kind=result_row; upstream_namespace=andorra:baseline-result-row; upstream_id=C([original_input_path,original_sheet,original_source_row]).
- Semantic: upstream_namespace=andorra:result-identity; upstream_id=C([N,office_id,HK,Electoral unit,Candidate or list,Party or proposer]). Exact strings/null; votes/share/seats excluded. All 53 tuples are unique.

Refresh resolves semantic binding first or an accepted explicit binding if labels/unit/event changed; same physical row cannot be rebound to another candidate. Reordered rows and corrected numbers keep IDs. New rows in an existing event get indices above every previously assigned index, multiple new identities ordered by C(semantic tuple); never recycle omitted indices. A new event uses incoming physical order starting r0. Ambiguous duplicates fail.

AD-M-05 2023 r0 is ENCLAR (1,989 votes), r1 is DEMÒCRATES + PROGRESSISTES SDP + INDEPENDENTS (1,802). Both preserve exact accents and full shares. party_namespace is `andorra/` + decimal cellYear(D.Year), baseline 2015/2019/2023; if missing later use literal unknown per bridge. Label/code copies D.Party or proposer verbatim, not a new standardized code. No cross-year alliance mapping without supplied concordance.

## Sources

Canonical source key `(andorra,country-package-andorra,source_id)`. Catalogue source_id=`andorra--`+S.Source ID. Exact token→catalogue ID; exact genuine URL→unique catalogue URL; unmatched genuine inline URL→`andorra--`+key("url",URL). Ten catalogue plus three actual inline-only sources. No URL normalization, decoding or domain deduplication.

Every existing bridge URL alias `andorra--`+key("url",URL) must resolve to the canonical source, including catalogue matches; preserve bare and prefixed catalogue IDs. Multiple catalogue rows sharing a URL cannot be silently merged: exact ID can resolve, ambiguous URL-only references become explicit unresolved evidence unless a previous accepted binding resolves them. A known bound source omitted from staging fails closed.

Concrete 2023 source: bare ID S6550aa0914, canonical andorra--S6550aa0914, exact URL https://www.eleccions.ad/resultats. Title/grade/accessed remain supplied; publisher=NULL despite legacy grade-as-publisher behavior. Three inline-only sources lack title/publisher/accessed metadata. No fabricated URL or source row for an unknown token. Exact source and URL-alias vectors are in the JSON companion.

## Internal keys and crosswalks

`record_key="rec-"+SHA(C([entity_kind,...target_components]))`:

| entity_kind | Ordered target_components |
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

Exclude R from stable input key; typed FK includes current L,R,input_path. All unused locator columns NULL. Date/tier/metric/release are not locator entity kinds.

`date_id="date-"+SHA(C([N,owner_type,owner_id,slot]))`: baseline owner_type=event, owner_id=event_id, slot=ballot. 21 rows, stable across value correction. No office next-date IDs baseline. Future independent date claims: owner_type=date_claim, owner_id=C([record_key,override_path,change_id+"/"+claim_id]), slot=value. Range endpoint slots append /start or /end. Claims never overwrite each other.

`evidence_id="ev-"+SHA(C([record_key,[source_country_id,source_namespace,source_id],occurrence_identity,claim_kind]))`; `unresolved_id="unres-"+SHA(C([record_key,occurrence_identity,original_token]))`. Occurrence tuple is defined in field-map Source notation, excludes mutable bytes/R; after explicit rebinding keep original occurrence identity and current physical locator separately. Multiple explicit claims append effective change_id/claim_id. Empty/unknown citation token is never a fabricated source FK.

Crosswalk PK `(entity_kind,upstream_namespace,upstream_id)`; target record_key must exist with matching kind:

| Alias | Namespace | upstream_id / target |
| --- | --- | --- |
| Original office | andorra:office-register | exact Office ID → office |
| Bridge office/event/result/geography | observatory:andorra | exact bridge ID → corresponding kind |
| Original/incoming-bound HK | andorra:history-key | exact HK → event |
| Bare source | andorra:source-catalogue | exact Source ID → source |
| Prefixed source / URL alias | observatory:andorra | exact bridge ID → canonical source |
| Exact source URL | andorra:source-url | URL → canonical source |
| Geography office code | andorra:geography-office-code | exact Office ID → geography |
| Result bindings | namespaces in Result rows | canonical tuple → result_row |
| Briefing | andorra:briefing | Office ID+.html → input locator for BF |
| Control observation | observatory:andorra:dated_governing_control | key("person-observation",[Office ID,Source date,Reported current control]) → Ctl input |
| Poll | observatory:andorra:poll | key("poll",["andorra",Pollster,Publication date]) → Poll input |
| Country | observatory:andorra | andorra → country |

Control/poll aliases preserve original entity type and row locator inside crosswalk.raw_json; seven observations share one retained sheet without becoming one observation. No typed poll/control table is invented. Existing aliases are append-only bindings unless a documented correction explicitly supersedes them; conflicts fail. Release alias is dataset_release.upstream_release_id=L, not a fictional locator kind.

## Fingerprint

Exact complete hash object is in Andorra_Input_Inventory.json/hash_inputs; /hash_inputs_canonical_json is the exact text to hash. Shape: canonicalization=atlas-c14n/1; hash_algorithm=sha256; lineage_id=L; inputs=[{input_path,input_kind,sha256,byte_count}]; overrides=[]; adapter_version=atlas-andorra-field-map/1; method_version=atlas-preserve-evidence/1; schema_version=atlas-master/1; schema_inputs=[{input_path,sha256}]. Sort each array by input_path with UTF-16 order. No duplicate paths across inputs/overrides.

Enumerate all 27 git-tracked regular package files plus approved T. *.html→artifact, T→tier_classification, other package files→package. Hash original bytes, verify 23 manifest entries first. Overrides, when actually accepted/applicable, use kind override and appear only in overrides, not twice. Unexpected files/symlinks/unpinned worktree inputs fail. Every retained input has one hash descriptor; DDL schema_inputs are separate, not research retained_input rows.

DDL logical names use the current runtime contract **0001_atlas_attempt_log.sql / 0002_atlas_master.sql** (physical prefix schemas/atlas/migrations/). The older saved Prompt B filename aliases are not fingerprint inputs for this new map. Migration bytes are unchanged:

- `0001_atlas_attempt_log.sql`: `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
- `0002_atlas_master.sql`: `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`

`fingerprint_sha256=SHA(C(hash_inputs))`; `R=L+"--sha256-"+fingerprint_sha256`. Typed versions equal JSON versions. Documentation-only reproducible vector (28 inputs, approved T, no overrides):

- Fingerprint: `55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983`
- Candidate R: `country-package-andorra--sha256-55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983`
- With only method_version changed to atlas-preserve-evidence/2 in an isolated **hash test**, digest: `cc7bfb98b4267e7442c117867954b39a6ab87f85525831f07ab5c88e218ace3d`. This is not a method approval or research correction.

Neither vector represents a loaded/published release. A future Andorra implementation must adopt this map's adapter semantics or explicitly version its changes and recompute. New attempt/time/operator/recovery path/git commit/unrelated lineage/publication receipt do not enter the fingerprint. Changed accepted tier/package/override/adapter/method/schema does. Optional shared Europe archive/workbook are recovery metadata already inside manifest; not additional projection or unrelated lineage hash inputs.

## Overrides and retained identities

No Andorra override is produced. Future atlas-override/1 files under data/overrides/atlas/andorra/ must identify lineage_id=L and changes[]; each change has change_id, target_table, full target_key, field (or identity_binding), expected_original, replacement, decision, reason, origin, claims[], supersedes_change_id and identity_binding (null unless used). Origin is exact source locator/hash. claims entries retain claim_id, source_id/source_url, locator, value, certainty; actual research claims require a supplied source reference. Operational identity bindings may have empty claims but cannot invent research facts.

Decisions follow existing contract accepted/withhold/withdraw/supersede/identity_binding. Reject missing/full-key mismatch, unsupported columns/types, unmatched expected_original (null is not wildcard), duplicate change IDs and competing unsuperseded patches. Apply supersedes DAG then input_path/change_id for independent changes; no cycles. Preserve both original and corrected claims. Documentation drafts/test fixtures are never executable production overrides. Tier approvals/changes require their own authorized reviewed input; none here.

Incomplete refresh carries all omitted offices, events, results, classifications, sources, evidence and aliases from a real previous publication. If retained old bytes share a path with new bytes, logical retained path is `inherited/sha256/<old_sha256>/<original_repo_relative_path>`. Preserve original kind/path/hash in raw and use actual retained path in typed input/classification FKs; include both byte versions in effective fingerprint. New effective Andorra rows all point to selected R; raw retains original R/location. Prior dataset_release plus full snapshot remains auditable.

Validate incoming tiers against incoming register and effective union against retained effective offices. Conflicting overlapping classifications require an explicit decision; no absent-office withdrawal. Full fresh baseline cannot omit an office. A sourced withdrawal changes record_state/note, keeps IDs and evidence addressable. No replace/delete shorthand.

## Publication identity

The DB publication is the complete selected lineage release set. Andorra-only publication preserves every unrelated lineage/R and row. Citations use the record's own L/R, never latest publication_receipt. Durable ledger is separate from swapped DB. Unchanged import creates a new attempt_id, same R/semantic research values; receipt may change, so SQLite byte equality is not the invariant. Failures leave last good publication and log failed attempts outside discarded staging. After ambiguous rename, reconcile receipt before terminal status. No successful release is claimed by these docs.
