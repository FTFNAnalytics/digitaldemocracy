# Spain identity rules — DRAFT

Pinned main `f7b5c81ebd39f1774edea7cde5b4155031d92647`. New research lineage **`country-package-spain`**; office namespace **`cdd-observatory-v1`**. These are proposed documentary identities for a new package, not a claim that official sources supplied Atlas strings. Every generated identity derives from an evidenced unit/body or occurrence. No office is inferred solely from an election window. All exact documentary vectors are in `Spain_Identity_Vectors.json`.

## Canonicalization and immutable identity

C(x) = compact UTF-8 JSON with recursively lexicographically sorted object keys, unescaped Unicode, array order preserved, finite numbers only. H(x) = lowercase SHA-256(C(x)). `key(prefix,x) = prefix + "-" + H(x)[0:24]`. This mirrors the pinned `normalize.ts`/`identity.ts` primitive contract. Spain tuples below are country-adapter-specific and include the office namespace; do not copy Albania's country literal or short event tuple. No ID includes display-name accents, current party label normalization, file mtimes, retrieval clock or attempt ID.

| Entity | Exact rule / natural key |
|---|---|
| Country | `spain`; country code `ES` |
| Municipal representation mandate | `ES-M` + five-digit INE CPRO+CMUN (preserve leading zeroes; omit check digit) + `-REP` |
| Autonomous-community parliament | `ES-A` + two-digit INE CODAUTO + `-PARL`, for the 17 evidenced communities |
| Congress / Senate / EP | `ES-CONGRESO`, `ES-SENADO`, `ES-EP`, each source-grounded national body/delegation |
| Ordinary provincial council | `ES-P` + two-digit CPRO + `-DIP`, only the 38 named FEMP bodies |
| Basque foral assembly | `ES-P01-JG`, `ES-P20-JG`, `ES-P48-JG` as enumerated by JEC |
| Additional island council | `ES-I` + INE CISLA + `-COUNCIL`, ten bodies; Formentera uses municipal `ES-M07024-REP` once |
| Aran | `ES-ARAN-COUNCIL`, JEC-evidenced special assembly |
| Geography | `ES`, `ES-Axx`, `ES-Pxx`, `ES-Mxxxxx`, `ES-Ixxx`, `ES-ARAN`; all country scoped |
| History key | `office_id + "::" + source year + "::" + exact supplied date label`; every current event has a sourced full-day label |
| Event | `key("event", ["spain", N, history_key])`; SQL key `(N,office_id,history_key)` |
| Municipal result | `key("result", [N,office_id,history_key,"municipal-original",source_row])`; row number is the retained block's one-based candidate/list ordinal |
| National aggregate result | `key("result", [N,office_id,history_key,"national-total",exact label])` |
| Source | `"spain--" + key("url", exact URL)` in source namespace L; full SQL key `(spain,L,source_id)` |
| Event date | `"date-" + H([N,"event",event_id,"election"])` |
| Evidence | `"ev-" + H([record_key,[spain,L,source_id],occurrenceIdentity,claim_kind])` |
| Unresolved token | `"unres-" + H([record_key,occurrenceIdentity,original_token])` |

`occurrenceIdentity` is the full canonical original locator object **excluding source_id**, including input_path, sha256, sheet/row/column or PDF page/block/bbox/table/cell where supplied. Omitted properties stay omitted; explicit NULL stays NULL. It is not only a filename. The complete vector's `source_pointer` notation is file+pointer (e.g. `/events.json/0` means `data/research/spain/events.json` JSON pointer `/0`). Every research row then carries the original source locator, byte hash and resolved source ID.

## Typed record keys and crosswalks

`record_key = "rec-" + H([entity_kind,...components])`:

| kind | components |
|---|---|
| country | `[spain]` |
| geography | `[spain, geography_id]` |
| office | `[N, office_id]` |
| event | `[N, office_id, history_key]` |
| result_row | `[N, office_id, history_key, result_row_id]` |
| source | `[spain, L, source_id]` |
| input | `[L, candidate_release_id, input_path]` |
| proceeding, if later supplied | `[N, office_id, history_key, proceeding_id]` |
| party_mapping, if later supported | `[spain, party_namespace, mapping_id]` |

Sparse record_locator fields follow the DDL exactly: an office locator has no geography_id; result locators have no proceeding_id; input locator has no country_id. These are typed locators, not polymorphic orphan IDs. `identity-crosswalk.json` preserves official municipal codes under `ine:municipality:representation` and research geography IDs; it asserts **no merger/split successor**.

## Municipal modes and historical codes

One REP ID denotes the municipality's evidenced elected representation mandate. A normal council does not gain a second direct alcalde. Explicit 2023 régimen de concejo abierto uses the same mandate identity labelled direct alcalde; 2026 mode confirmation remains open. A future evidenced council/open-council transformation must retain old events and mode claims, and use an explicitly reviewed temporal identity decision rather than silently reinterpreting earlier contests. 3,762 current modes remain pending; no guessed direct/council classification resolves them.

The INE snapshots identify four historical codes absent from 2026: 15026, 15063, 36011 and 36012. Keep these rows even where numeric results are absent. No legal start/end date is inferred from snapshot presence. Name normalization used for source binding removes diacritics/punctuation, sorts remaining tokens and removes a fixed article set, **only within an exact province** and only when exactly one official code matches. No fuzzy edit-distance matching. All unbound and duplicate claims remain retained. Where reused codes or ambiguous names emerge, stop for an evidenced temporal binding; do not guess a successor.

Municipal result ordinals identify the original publication row; a correction does not silently re-sort/re-key it. Preserve original result ID and scalar claims in a guarded accepted override, or retain a new source claim with explicit crosswalk/decision. Two nonidentical 2015 blocks are disputed, not first-wins reconciled. National totals are not combined with province totals; original party labels are not globally merged.

## Fingerprint and release versus attempt

Exact hash inputs are in `Spain_Input_Inventory.json /hash_inputs`: all retained effective research/source descriptors and the draft tier, sorted by path; `overrides=[]`; adapter `atlas-spain-full-register/1`; method `atlas-preserve-evidence/1`; schema `atlas-master/1`; canonicalization `atlas-c14n/1`; both pinned migration hashes. No report/ZIP/vector/manifest hash enters its own fingerprint, and no unrelated lineage is included.

Documentary fingerprint: `850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17`.

Candidate release ID: `country-package-spain--sha256-850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17`.

This is **not a published release**. Accepting or editing tier bytes changes the fingerprint and release; unchanged bytes/versions reproduce the same release. A future invocation always creates a new durable `attempt-<UUID>` even when R repeats. Source URL remains identity while changed source bytes affect release. Corrected data preserve stable entity IDs and original guarded claims.

## Refresh and publication ownership

Incomplete refresh is never deletion. Carry forward omitted effective offices/events/results and their retained source hashes, or fail closed if the necessary prior inputs are unavailable; hash the merged effective set. An explicit sourced withdrawal may change record_state, never erase history. Offices cite their own `(L,R)` publication member. Europe-only refresh must leave LatAm/NZ and other Europe release IDs, rows and evidence unchanged; never attach them to Spain's receipt. No public legacy Spain IDs or release aliases were supplied, so none are fabricated.

Draft tier SHA: `f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f`. All approval boxes remain unchecked. No SQL/importer/website execution occurred.
