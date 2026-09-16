# Albania identity rules

Contract v1 for [Albania_Field_Map.md](Albania_Field_Map.md), frozen main `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`. These are exact implementation rules, not imported records. Existing bridge keys come from `lib/observatory/adapters/europe.ts`, `lib/observatory/adapters/tables.ts` and `scripts/import/normalize.ts` at that commit. Frozen input bytes and existing public IDs remain unchanged. Namespace constants below are Atlas storage choices, not invented research facts.

## Constants and encoding

| Symbol | Exact value |
| --- | --- |
| N, office/event identity namespace | `cdd-observatory-v1` |
| L, Albania source lineage | `country-package-albania` |
| Source namespace | `country-package-albania` |
| Country ID | `albania` |
| Adapter version | `atlas-albania-field-map/1` |
| Method version | `atlas-preserve-evidence/1` |
| Schema version | `atlas-master/1` |
| Canonical tier path | `schemas/atlas/tiers/albania.json` |

`C(value)` means the exact compact JSON encoding produced by the existing bridge's `stable`: recursively sort object keys by JavaScript UTF-16 code-unit order; retain array order; use JSON.stringify string escaping and number rendering, no indentation, no BOM, no trailing newline, UTF-8 encoding. Do not normalize Unicode, trim string values or coerce numbers to strings. Reject non-finite numbers, duplicate object keys, undefined and unpaired surrogates. Hash-input objects use ASCII keys, integer byte lengths and strings, avoiding language-dependent fractional-number serialization. An implementation in another language must match these bytes, not merely parse to an equivalent object.

`SHA(x)` = lowercase, full 64-hex SHA-256 of the UTF-8 bytes of x. Bridge `key(prefix,value)` = `prefix + "-" + SHA(C(value))[0:24]`. New internal keys use the full digest. Compare the complete unhashed identity tuple on collisions; fail rather than overwrite. Only operational attempt_id is random (`attempt-` + lowercase UUIDv4). No research identity uses an attempt ID, release digest, process time, locale or database rowid.

## Offices and geography

`office_id` is exactly O.Office ID. Office PK is `(N,office_id)`; country must be `albania`. Baseline contains 122 unique IDs and exactly one tier classification per ID. Existing office IDs, e.g. `AL-13-M`, are not renamed or prefixed inside office_id.

Baseline geography ID is **the existing bridge binding** `key("geo",["albania",O.Jurisdiction,O.Office])`. There are 122 geographies, because office type participates. Retain each geography's original source code (Office ID) in raw provenance and a crosswalk. Do not collapse by municipality name. Once bound, a corrected display spelling does not change the geography ID; an actual sourced geographic replacement needs explicit identity instructions, outside the current reform non-goal. Parents and effective dates are NULL unless supplied.

| Office | Geography ID |
| --- | --- |
| AL-13-M | geo-99a7b8d0e325a448c5e7c7ca |
| AL-13-C | geo-29ca1a846eec3250b36d39f9 |
| AL-52-M | geo-cb91810264cd90d2ef316d0e |

## History keys and public event IDs

Use the bridge `cellText`: null/absent → empty string; string unchanged; finite number → JavaScript decimal String(number); other types reject in identity inputs. `cellYear` accepts an integer number or a string whose trimmed value is exactly four digits; otherwise null. Reject invalid actual year ranges as validation, not an identity fallback repair.

For a baseline H row:

- `year_part = cellYear(Year)` rendered in decimal if nonnull; otherwise `cellText(Year)` when nonempty, otherwise literal `undated`.
- `HK = Office ID + "::" + year_part + "::" + cellText(Ballot date if recorded)`.
- `event_id = key("event",["albania",HK])`.
- PK = `(N,Office ID,HK)`; public uniqueness = `(N,event_id)`.

D uses the exact same fields and HK rule and must match one H row. Do not match only office+year, truncate date qualifiers, or silently pick a nearest date. Numbered H files are authoritative selected membership; `history-index-crosscheck.json` only reconciles their content. Each baseline office has exactly three selected histories.

| Office / HK | Exact bridge event_id |
| --- | --- |
| AL-13-M::2023::2023-05-14 | event-9b7cd1a6a6d27850e712e6a7 |
| AL-13-C::2023::2023-05-14 | event-42aa961113176bd7302e00d8 |
| AL-52-M::2023::2023-07-23 | event-fc68f2719386d599c584111d |
| AL-52-M::2022::2022-03-06 | event-0e6fd800ff9be3e149eeee0f |

A corrected date must not silently generate a new public event: an explicit identity-binding override names the original full PK, old HK/event_id and incoming corrected row tuple. Preserve the original stored HK/event_id and add the incoming HK as an alias to the same event. date_id retains its owner binding while its value changes in the new release. A genuinely separate replacement election has a distinct HK/event_id. If the source only changes its date key and supplies no unambiguous identity binding, fail for review; do not guess it is either a correction or a new election.

Upcoming events: no baseline O.Next polling date is supplied, so **no next event, next_history_key or public next ID is created**. If a later input actually contains an already-public bridge upcoming event, preserve its `key("next",office_id)` ID and corresponding history key; new future-event mapping requires explicit source/date identity. A shared calendar cohort or proposed reform year is not that input.

## Result row IDs and refresh bindings

On this frozen baseline, concatenate D shards in lexical file-name order (`001`…`021`); preserve each rows array's order; group by HK while preserving that encounter order. For zero-based index i within a group, **result_row_id = event_id + "-r" + decimal(i)**. This exactly preserves bridge result IDs; never sort by votes, name or party before assigning them.

Persist two bindings in identity_crosswalk plus origin in raw_json:

1. Physical baseline binding: upstream_namespace=`albania:baseline-result-row`; upstream_id=C([original input_path, original sheet, original source_row]); entity_kind=result_row.
2. Semantic binding: upstream_namespace=`albania:result-identity`; upstream_id=C([N,office_id,HK,Electoral unit,Candidate or list,Party or proposer]); exact strings/nulls. This tuple is unique for every one of the 3,843 baseline rows; it deliberately excludes votes/share/seats.

On refresh, resolve semantic binding first, or a documented explicit identity override if the label/unit/event key changed. Validate any same physical locator against that resolved identity; never reuse a row number for a different candidate. Exact same candidate tuple with corrected numbers retains ID. Reordering rows does not change ID. Ambiguous duplicates or conflicting bindings fail closed. A genuinely new result for an existing event receives the next integer greater than **all previously assigned** r-indices for that event; assign multiple new identities in C(semantic tuple) order and retain their bindings. Never reuse omitted/withdrawn indices. A new event starts at r0 in its incoming physical order. If a future row cannot be distinguished by the semantic tuple, require a sourced row ID or explicit identity binding before importing it.

`AL-13-M` / 2023 baseline r0 is Arif Faik Tafani (4,564 votes); r1 is Bedri Skënder Qypi (4,515). These IDs cannot swap if a later display sorts by votes. The result row's party namespace remains the existing bridge `albania/<Year>` token; it is not a claim that parties are equivalent across elections. There is no party_mapping row until a sourced concordance exists.

## Sources and aliases

The catalogue has 182 rows, unique Source IDs and unique exact Source URLs. Canonical source tuple is `("albania","country-package-albania",source_id)`.

- Catalogue source_id = `"albania--" + S.Source ID`.
- Resolve a source token by exact catalogue Source ID; resolve a genuine URL by exact Source URL match.
- If a URL is genuine but has no catalogue row, source_id = `"albania--" + key("url",original_URL_string)`. There are three such URLs in this package; preserve NULL absent metadata.
- For every known URL, preserve the bridge URL-form alias `"albania--" + key("url",URL)` in identity_crosswalk. If URL matches catalogue, point that alias to the catalogue source locator rather than duplicating a source row. Do not rewrite, decode or strip URL components before matching/hashing.
- Preserve the bare catalogue Source ID and existing country-- ID as aliases. A URL in source-links is provenance, not permission to fabricate publisher/title/access date.

Concrete shared archive source: Source ID `Sfaae00802d`, canonical `albania--Sfaae00802d`; URL `https://iemis.kqz.gov.al/results2023/input/results/json_all_summary_0_bashki_lh.txt`; bridge URL alias `albania--url-79f33cdf44c3677da541259e` resolves to the same source. The catalogue title and Accessed value are preserved. Publisher remains NULL despite the legacy bridge's Evidence-grade-as-publisher behavior.

A missing/invalid token has no fabricated source_id. Preserve it in unresolved_evidence if it was genuinely unmatched during resolution. A source known from input inventory or a prior binding but omitted from staging is a fatal broken reference. For later duplicate catalogue URLs, do not merge different catalogue Source IDs automatically: exact Source ID may resolve, ambiguous URL-only citation stays unresolved with reason and original token. Previously resolved aliases cannot silently change target.

## Internal locators, dates, evidence and crosswalks

`record_key = "rec-" + SHA(C([entity_kind,...target_components]))`, using the following exact ordered target_components. These are internal addressable lookup keys; public IDs are unchanged.

| entity_kind | target_components |
| --- | --- |
| country | [country_id] |
| geography | [country_id,geography_id] |
| office | [N,office_id] |
| event | [N,office_id,HK] |
| proceeding | [N,office_id,HK,proceeding_id] (none in baseline) |
| result_row | [N,office_id,HK,result_row_id] |
| party_mapping | [country_id,party_namespace,mapping_id] (none in baseline) |
| source | [country_id,source_namespace,source_id] |
| input | [L,input_path] |

For an input target, exclude release_id from the stable key but point its current typed FK to `(L,R,input_path)`. If an inherited old version shares a path with a new version, use the inherited path rule below, preserving the old original path in raw provenance. All unused typed locator columns are NULL; use the exact shapes enforced by the DDL.

`date_id = "date-" + SHA(C([N,owner_type,owner_id,slot]))`. Baseline: owner_type=`event`, owner_id=event_id, slot=`ballot`. No date IDs are made for the 122 unknown next dates because office.next_date_id is nullable. Events require a date row even for unknown labels under the DDL. For later independent competing claims use owner_type=`date_claim`, owner_id=C([record_key,override_path,claim_id]), slot=`value`; claim_id is an explicit unique stable ID inside that retained override. Range endpoints append `/start` and `/end` to slot. This prevents two competing values from overwriting one another.

Occurrence identity is exactly the locator tuple defined in the field map, without mutable SHA/release. `evidence_id = "ev-" + SHA(C([record_key,[source_country_id,source_namespace,source_id],occurrence_identity,claim_kind]))`. For multiple explicit claims at one occurrence, append claim_id to occurrence_identity. A new independent source claim gets a distinct evidence ID; correcting a value at the same bound occurrence retains the ID and prior version in the old full snapshot. `unresolved_id = "unres-" + SHA(C([record_key,occurrence_identity,original_token]))`.

Crosswalk PK is `(entity_kind,upstream_namespace,upstream_id)`. Use these exact namespace families:

| Alias | upstream_namespace | upstream_id | Target |
| --- | --- | --- | --- |
| Original office ID | albania:office-register | exact Office ID | office |
| Bridge office/event/result/geography ID | observatory:albania | exact existing bridge ID | corresponding entity kind |
| Original history key | albania:history-key | exact HK | event |
| Bare source ID | albania:source-catalogue | exact Source ID | source |
| Country-- source ID / bridge URL alias | observatory:albania | exact prefixed ID | canonical source |
| Raw source URL | albania:source-url | exact URL | canonical source |
| Geography office-code alias | albania:geography-office-code | exact Office ID | geography |
| Result baseline/semantic binding | namespaces defined above | canonical tuple string | result_row |
| Briefing filename | albania:briefing | exact Office ID + .html | input locator for BF |
| Retained control observation ID | observatory:albania:dated_governing_control | existing bridge key below | input locator for Ctl |
| Retained poll ID | observatory:albania:poll | existing bridge key below | input locator for Poll |

Control ID is `key("person-observation",[Office ID,Source date,Reported current control])`; poll ID is `key("poll",["albania",Pollster,Publication date])`, exactly as bridge. Their crosswalk entity_kind=input is intentional: no typed observation/poll tables in Phase 1. raw_json includes original entity type and exact row locator to preserve distinctions among 45 aliases pointing to the same retained sheet. Country alias may similarly use observatory:albania / albania with entity_kind=country. Preserve all aliases already stored on refresh; duplicate alias pointing to a different target is an error.

No proceeding_id or party mapping_id is generated for this baseline. When structured IDs are actually supplied later they must be preserved with their sourced event/context; this document does not authorize creating them from narrative phrases. Release aliases belong in dataset_release.upstream_release_id, not a fictitious record_locator entity kind.

## Fingerprint and release identity

Use the following exact object shape for dataset_release.hash_inputs_json (the entries are schema descriptions here, not literal placeholders to hash):

```json
{
  "canonicalization": "atlas-c14n/1",
  "hash_algorithm": "sha256",
  "lineage_id": "country-package-albania",
  "inputs": [
    {"input_path": "repo-relative path", "input_kind": "package|artifact|tier_classification", "sha256": "original-byte digest", "byte_count": 0}
  ],
  "overrides": [],
  "adapter_version": "atlas-albania-field-map/1",
  "method_version": "atlas-preserve-evidence/1",
  "schema_version": "atlas-master/1",
  "schema_inputs": [
    {"input_path": "001_atlas_attempt_log.sql", "sha256": "e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1"},
    {"input_path": "001_atlas_master.sql", "sha256": "1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da"}
  ]
}
```

Exact enumeration: use all git-tracked regular files recursively under `data/countries/albania/` in the pinned accepted input tree (163 here), excluding nothing based on whether it has a typed projection. Add the accepted T. Reject unexpected files/symlinks or an unpinned worktree; do not accidentally include temporary files. Hash every original byte stream; verify all 159 manifest.files entries first. The four additional tracked files are manifest.json, README.md, extract.py, validate.py. HTML uses input_kind=artifact; T tier_classification; all other package files package. No manifest self-hash recursion: manifest bytes are hashed as a normal input; its files map does not include itself.

Sort inputs by input_path using UTF-16 code-unit order. Applicable override entries have the same four-key shape, input_kind=override, in overrides sorted by input_path; they are not also duplicated in inputs. Use an explicit empty overrides array when none. Sort schema_inputs by input_path. Every retained_input has exactly one input/override descriptor; schema_inputs describe the governing DDL separately and do not create research retained_input rows. The immutable input store resolves every retained descriptor's hash. Recovery paths, fetched times, repository commit, operator, attempts, backup path and publication set are not fingerprint members. The commit is audit provenance, not a reason to change a release whose bytes are identical.

`fingerprint_sha256 = SHA(C(hash_inputs_object))` and `release_id = L + "--sha256-" + fingerprint_sha256`. Store C(hash_inputs_object) verbatim in hash_inputs_json. Typed version fields must equal their object members. Hash never uses SQLite bytes. Changing a package/accepted tier/override/version/DDL digest changes the release; changing an attempt, locator placement or unrelated lineage does not. Same lineage+digest is one immutable dataset_release row. New hash candidates are published only after validation and atomic swap; failed attempts never mint a public release.

The shared archive/workbook is an optional recovery container, not directly re-read into typed projection. Its metadata is already retained inside manifest bytes. Do not add unrelated current Europe/LatAm/NZ releases to Albania's fingerprint merely because the original workbook was shared.

## Override and binding input contract

This defines the document format the importer must accept; there are **no actual overrides in the frozen baseline**. An override file under `data/overrides/atlas/albania/` has root fields `schema_version` = `atlas-override/1`, `lineage_id` = L, and `changes` (array). Every change has these exact keys:

| Key | Required meaning |
| --- | --- |
| change_id | Nonempty stable string, unique across applicable override files in this lineage |
| target_table | One actual destination entity table; publication/ledger/release metadata are not patch targets |
| target_key | Object with every column in the target table PK and no inferred components |
| field | Exact destination scalar field, or `identity_binding` for a binding-only change |
| expected_original | Exact source/previous typed value; JSON null means expected missing, not wildcard |
| replacement | New value, or null for withholding; never write an absent replacement as numeric zero |
| decision | accepted / withhold / withdraw / supersede / identity_binding |
| reason | Nonempty explanation supplied with the override |
| origin | Original locator object including path, original byte hash, source row/field/pointer |
| claims | Array of {claim_id, source_id, source_url, locator, value, certainty}; one of exact source_id or real source_url is required for a research claim; unused member null |
| supersedes_change_id | Null or exact prior change_id explicitly replaced by this decision |
| identity_binding | Null, or {entity_kind, original_key, incoming_key}; full keys, not partial display-name matches |

Unknown keys in target_key, missing required keys, duplicate change_id, unmatched expected_original, unsupported field/type or dangling source/identity reference fail closed. `claims` can be empty only for purely operational identity bindings; research value/state changes require supporting claims. Certainty is one of the research_date enums or null for a non-date claim. Stable claim_id is local to the globally unique change_id; use `change_id + "/" + claim_id` as the effective claim_id in date/occurrence identities.

Apply supersedes dependencies topologically (then lexical input_path and change_id for independent changes). Competing unsuperseded accepted changes to the same target/field fail. A withhold decision explicitly names all competing claims and retains their origins rather than choosing whichever file sorts last. A changed source row may be matched to the old ID only through unambiguous existing bindings or this explicit identity_binding object. Omitted records are not represented by an implicit withdrawal override. Test-only overrides and fixture provenance are rejected by the production publication path.

## Incomplete refresh and inherited inputs

Missing rows in a new incomplete snapshot do not delete or withdraw records. Keep the original office/event/result/source/classification and all their locators/evidence/crosswalks. Repoint their active-row release_id to the new selected R while retaining origin hashes and previous release ID in raw metadata. Keep prior release metadata and a full snapshot of prior row contents.

If a new input reuses the original path with different bytes and a carried row still depends on the old bytes, retain the old whole file at deterministic logical path `inherited/sha256/<old_sha256>/<original_repo_relative_path>`. Include that descriptor in inputs (or overrides for an inherited override), retain the original kind, and keep the original path and byte hash in origin metadata. Update the typed input FK to the inherited path where necessary; preserve old alias keys and historical record identity. Copied raw envelopes distinguish original path from retained path, so lookups are exact, never “whichever file currently has that name.” Tier FK classification_path must point to whichever retained accepted classification bytes actually supplied that row, with original canonical path retained raw.

The effective classification union must cover exactly the effective retained office set, even if the incoming reduced register/tier file omits an office. A full fresh baseline cannot omit any of the 122. On an incomplete refresh, validate each incoming classification against its incoming register, then validate the effective union against the effective retained register; do not call absent offices newly withdrawn. Multiple tier files must agree on any overlapping office or have an explicit documented override. Hashes of both incoming and inherited sources enter the new release.

## Draft fingerprint vector and publication boundary

The canonical tier path is absent on main. Therefore **no valid production release fingerprint can be claimed here**. For a reproducible documentation-only hash vector, use the 163 frozen tracked files and place the available Phase 0 draft bytes at the logical canonical tier path in memory (do not write it into the repo). The draft tier digest is `9d6c74454e7454acbebab3606aec4998c3346e12107a3077cfe22de607471081`. With the exact versions/DDL hashes above and overrides=[], the 164-descriptor candidate fingerprint is:

`a3a5208c59684e78cab83ead689bfe677b8692940211d9889e1020848c9506be`

This is not a published release and fails the approved-tier precondition. Repeating that exact calculation produces the same digest. Changing only method_version to `atlas-preserve-evidence/2` yields:

`c8cf910a583db8c065698c70f73df098a6961e2b5fc3181610e82f9207af1ac7`

Neither vector authorizes a code/version change or tier approval. Once the accepted file exists, compute the real fingerprint from those bytes; do not reuse the draft vector if the approval metadata changed.

Publication is the complete set of selected `(lineage_id,release_id)` pairs. ledger attempts are outside the swapped DB; publication_receipt ties the physical file to the attempt. On unchanged re-import, retain the same release and semantic content but use a new attempt/receipt. On a failed or ambiguous publication, use the accepted plan's rollback/reconciliation protocol; never fabricate a success timestamp or cross-file FK.
