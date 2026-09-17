# Bosnia and Herzegovina identity rules

Prompt O draft. Main contracts `6e6426fe17f6f542b58b68f8607124e007b852ff`; frozen PR #15 package `98408339e233e8580ec535cc24e8762ff5c6533f`. Office IDs are real package IDs; all generated event/result/geography/source IDs are proposed bridge-compatible identities, not a claim of existing public Bosnia IDs. [Vectors](Bosnia_Identity_Vectors.json) enumerate every baseline office/geography, 52 events/dates, 749 results and 30 sources with exact locators. No importer/SQLite execution.

## Constants and canonical encoding

| Constant | Value |
| --- | --- |
| N office/event namespace | cdd-observatory-v1 |
| L lineage and source namespace | country-package-bosnia-and-herzegovina |
| CID / country code / polity_kind | bosnia-and-herzegovina / BA / sovereign_country |
| Proposed adapter | atlas-bosnia-and-herzegovina-field-map/1 |
| Method / schema | atlas-preserve-evidence/1 / atlas-master/1 |
| Draft tier path | schemas/atlas/tiers/bosnia-and-herzegovina.json |
| Draft tier SHA | 3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1 |

Use `C(value)` exactly as current scripts/import/normalize.ts stable (also lib/atlas/identity.ts canonical): JSON.stringify with recursive object-key sorting by JS UTF-16 order, original array order, UTF-8, no BOM/indent/trailing newline. Preserve JavaScript escaping/number rendering and numeric-property JSON semantics; a non-JS implementation must match exact bytes. Reject duplicate JSON keys, undefined, nonfinite numbers/unpaired surrogates; never normalize Unicode/trim identities. Hash descriptors use strings/integer lengths, not fractional research values.

SHA(s) = full lowercase SHA-256 of UTF-8 s. Bridge `key(prefix,v)=prefix+"-"+SHA(C(v))[0:24]`. New internal IDs use full digest. Compare complete identity tuples on collisions; fail rather than overwrite. Only attempt_id is random (`attempt-`+lowercase UUIDv4). Research IDs never use time, database rowid, attempt ID or R.

## Office and entity/canton geography identities

Copy O.Office ID exactly. PK=(N, office_id). Required set BA-201…BA-210, BA-F, BA-R, BA-G. BA-F identifies the Federation House of Representatives; BA-R the RS National Assembly; BA-G the RS President. National in BA-R's office title does not override the RS jurisdiction. BA-G is not Brčko or a country-wide presidency. No Brčko/municipal/mayor office is supplied or added.

All 13 proposed geographic tiers are regional; preserve institution_scope entity/canton in T and raw. T only drives tier, never cohort wording or ID-prefix guesses. Every row stays draft; three entity rows have focused flags. Future approval must explicitly accept/clear them; this document cannot promote needs_review to approved. No unknown assignment silently becomes other. Unused legacy council metadata is not an allowed DDL geographic tier.

G=key("geo",[CID, O.Jurisdiction, O.Office]); 13 unique keys verified. Office type deliberately participates in the established Europe convention, so RS assembly/president have two geography bindings for the same jurisdiction. They do not imply two entities. Parent/effective dates remainNULL; no geometry or invented country/parent office. Preserve exact original tuple as crosswalk binding; future display corrections retain G. Actual boundary replacement requires sourced explicit identity binding, not name-based merge.

## Historical and prospective event identities

cellText: null/absent→empty string; string unchanged; finite number→JS String(number); otherwise reject. cellYear: integer number or trimmed exactly-four-digit string, otherwiseNULL; validate real range separately. year_part=decimal cellYear if present, otherwise exact nonempty cellText(Year), otherwise literal undated.

H HK=`Office ID+"::"+year_part+"::"+cellText(Ballot date if recorded)`; IX and D use equivalent fields. All baseline ballot-date segments are empty. event_id=key("event",[CID, HK]); PK=(N, office_id, HK); public uniqueness=(N, event_id). Namespace/office/HK are required on every result/proceeding FK, not event_id alone.

39 H keys equal39 IX keys. Compare all shared fields under documented table/CSV normalization: table null↔CSV empty; numeric↔numeric string with exact numeric equality; IDs/text/URL exact. H is authoritative typed history source; IX is retained reconciliation provenance and adds0 events. Each supplied office has three regular-cycle histories2014/2018/2022. Master detailed returns bind749 rows to those39 keys. Companion membership0 is expected for all 13 offices; it is not a missing-data reason to drop them. HTML/H leader summaries do not create duplicate result rows.

All 13 O.Next polling date cells are supplied. Next event_id=key("next", office_id); HK=event_id; role none. Historical role selected gives 39; 13 next gives 52 total. Next identities exclude polling date/attempt/release, so corrected dates retain identity. A genuinely distinct later cycle needs explicit sourced/versioned binding before reusing a next ID could overwrite a different contest. Do not create a future event from a bare expected-cycle note when O date is absent in a later package.

The unresolved RS presidential replacements/repeats are **not supplied identities**. Keep BA-G's three source histories and expected next record; no new event, HKey, proceeding, annulment or numeric row from the country gap note. Do not attach missing presidential records to BA-R. A future accepted key-bearing correction preserves old public identity through identity_binding naming full old PK/HK/event_id, incoming tuple and source evidence. Actual distinct elections remain distinct; no guessed name/date matching.

## Date identities and certainty

Each event ballot owner uses date-+SHA(C([N,"event", event_id,"ballot"])).52 distinct owners. office.next_date_id reuses corresponding next event date_id; no additional office-owned date copy.

39 histories:label is source Year, precision year, year 2014/2018/2022, month/dayNULL, certainty unknown. All dedicated ballot cells are NULL; URLs/titles/regular cycle do not supply a day.13 next events:label2026-10-04, precision day, year 2026/month10/day4, certainty expected. Explicit O day agrees with Cal /rows/0/4; Cal /rows/0/6 says Scheduled cycle / expected; details vary. Store both exact locators plus Cal source homepage occurrence. O.Calendar evidence isNULL; no fabricated official decree. Resolved date pointer means single labelled source value, not independently confirmed legal call.

Future YYYY-MM retains month precision/dayNULL; YYYY retains year precision; no day1. Unknown event date gets an explicit unknown research_date because DDL requires nonnull event.date_id for resolution unknown/resolved. An office with unknown next date need not gain a fabricated event. True ranges need sourced ordered, noncyclic endpoints with slots ballot/start and ballot/end.

Competing claims: owner_type=date_claim; owner_id=C([record_key, override_path, change_id+"/"+claim_id]); slot=value; generic date ID=date-+SHA(C([N, owner_type, owner_id, slot])). Keep each claim/date/evidence with source locator, withhold selected event/office date pointer and office.next_history_key using resolution conflicting. Old claims remain auditable. No certainty escalation from a source homepage or supplied day alone.

## Result IDs and source-party context

Read single D /rows in physical order; group by exact HK without sorting candidates/votes. Baseline result_row_id=event_id+"-r"+zero-based index within group.749 unique semantic tuples/IDs; no prospective results. Freeze two crosswalks:

- Namespace bosnia-and-herzegovina:baseline-result-row; upstream_id=C([original_virtual_input_path, original_sheet, original_source_row]).
- Namespace bosnia-and-herzegovina:result-identity; upstream_id=C([N, office_id, HK, D.Electoral unit, D.Candidate or list, D.Party or proposer]).

All Electoral unit cells are NULL but remain part of semantic tuple. Votes/share/seats excluded from identity. Refresh resolves existing semantic/explicit accepted binding before physical row order. Reordering/correcting numeric values keeps IDs; new tuples in existing events get indices above all ever assigned, ordered by C(tuple) for simultaneous new rows. Omitted indices never recycled. New events beginr0 in incoming order. Duplicate/renamed ambiguous identities fail pending explicit sourced binding.

Candidate label uses exact Candidate or list, then Party or proposer, elseNULL. Original party label/code preserve exact Party or proposer under combined label/code convention. party_namespace=CID+"/"+cellYear(D.Year), or literal unknown if absent later. Never harmonize coalition labels, capitalize spellings, split Others into invented parties, or treat NEZAVISNI KANDIDAT as one canonical party. No party_mapping supplied. Source elected/substitute flags absent→NULL; do not copy bridge default false. SeatsNULL→unknown, 0→zero, positive→recorded; vote/share values copied, no rounding/recalculation. No metrics.

## Source and evidence identities

Source PK=(CID, L, source_id); catalogue source_id=CID+"--"+S.Source ID.28 catalogue IDs/URLs unique. H/D supply Source URL rather than Source ID; exact unique URL resolves catalogue. Preserve query and hash fragments. Two inline-only URLs (CEC homepage and screening page) use CID+"--"+key("url", exactURL), metadataNULL where absent. Total30. No fresh source-page hash/publisher/title inferred; table SHA belongs to locator provenance.

Bare and prefixed catalogue aliases plus URL-form aliases survive. URL alias CID+"--"+key("url", URL) points to catalogue row when matched. Resolve exact ID token if later supplied, then unique exact URL; token/URL disagreement or duplicate conflicting catalogue metadata fails review. Real unmatched HTTP URL may create inline source; malformed/unmatched/ambiguous citation tokens stay unresolved_evidence against a real target. A known resolved missing source is fatal FK failure, never demoted unresolved.

`record_key="rec-"+SHA(C([entity_kind,...ordered_components]))`:


| Kind | Ordered components |
| --- | --- |
| country | [country_id] |
| geography | [country_id, geography_id] |
| office | [N, office_id] |
| event | [N, office_id, HK] |
| proceeding | [N, office_id, HK, proceeding_id]; none baseline |
| result_row | [N, office_id, HK, result_row_id] |
| party_mapping | [country_id, party_namespace, mapping_id]; none baseline |
| source | [country_id, source_namespace, source_id] |
| input | [L, input_path] |

Unused typed locator columns NULL; one valid DDL target shape, existing FK. Input key excludes R while actual input FK includes current L/R. No locator entity kinds for dates, tiers, metrics or releases. Date claims target event/office, tier provenance points to retained T.

Occurrence tuple is `[original_input_path,sheet,source_row,column,json_pointer,html_anchor_index]` from field-map locator, excluding mutable SHA/R. `evidence_id="ev-"+SHA(C([record_key,[source_country_id,source_namespace,source_id],occurrence_tuple,claim_kind]))`. Multiple explicit claims append effective change_id/claim_id to occurrence tuple. `unresolved_id="unres-"+SHA(C([record_key,occurrence_tuple,original_token]))`. Prior bindings remain stable across location/value corrections; raw carries current physical location separately. Calendar date and certainty are one sourced prospective claim with exact separate locators in claim_json, not an invented source.

## Alias namespaces

Crosswalk PK=(entity_kind, upstream_namespace, upstream_id), same-kind real record_locator target required. Preserve aliases; contradictory target fails. “observatory” aliases here are proposed compatibility bindings, not already-public Bosnia IDs.

| Alias family | upstream_namespace | ID/target |
| --- | --- | --- |
| Original office | bosnia-and-herzegovina:office-register | exact Office ID→office |
| Compatible office/geography/event/result/country | observatory:bosnia-and-herzegovina | projected ID→matching typed target |
| Original/accepted incoming HK | bosnia-and-herzegovina:history-key | exact HK→event, including next keys |
| Bare catalogue | bosnia-and-herzegovina:source-catalogue | Source ID→source |
| Prefixed source /URL-form alias | observatory:bosnia-and-herzegovina | exact prefixed/URL key→canonical source |
| Exact URL | bosnia-and-herzegovina:source-url | URL→source |
| Geography office code | bosnia-and-herzegovina:geography-office-code | Office ID→geography |
| Physical/semantic result | namespaces above | C(tuple)→result |
| Briefing | bosnia-and-herzegovina:briefing | Office ID+.html→retained BF input |

No invented poll/control/metric locator kinds. Unstructured artifact sections remain accessible by original input/hash/heading locator, not new events. Proposed lineage alias country-package-bosnia-and-herzegovina belongs to dataset_release.upstream_release_id, not a fictional release record_locator.

## Fingerprint and effective-input identity

Exact canonical object and descriptors are in Bosnia_Input_Inventory.json. Object fields:canonicalization=atlas-c14n/1; hash_algorithm=sha256; lineage_id=L; inputs=[{input_path, input_kind, sha256, byte_count}]; overrides=[]; adapter_version=atlas-bosnia-and-herzegovina-field-map/1; method_version=atlas-preserve-evidence/1; schema_version=atlas-master/1; schema_inputs=[{input_path, sha256}]. Arrays sort by logical input_path in JS UTF-16 order, no duplicate paths across inputs/overrides.

7 outer files+27 members+T=35 descriptors. V=package prefix+unpacked/+exact tar member, not a tracked directory. HTML/chunk=artifact, T=tier_classification, other package/member files=package. Original master XLSX/shared archive hashes are retained provenance metadata, not additional effective inputs; no cross-country dependency or duplicate combined-gzip input. Each retained_input has exactly one descriptor and immutable recoverable bytes (sha256:<digest> store plus commit/path or exact payload member provenance). Inventory.json itself has one independent hash, no recursive self-hash.

Schema logical filenames below have physical prefix schemas/atlas/migrations/:

- `0001_atlas_attempt_log.sql`: `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
- `0002_atlas_master.sql`: `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`

Fingerprint=SHA(C(hash_inputs)); R=L+"--sha256-"+fingerprint.

- Draft-only fingerprint: `a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b`
- Draft-only candidate R: `country-package-bosnia-and-herzegovina--sha256-a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b`

This vector hashes draft T and is **not publishable**. Justin's approval changes T bytes and must change R. Identical approved effective inputs reuseR with a fresh attempt UUID. Package/tier/accepted override/adapter/method/schema changes alterR; exclude attempt/time/operator/git SHA/absolute scratch locator/unrelated lineage/publication set. Failed attempts mint no public release. No schema executed by these hash vectors.

## Overrides, incomplete refresh and publication coexistence

Future data/overrides/atlas/bosnia-and-herzegovina/ files follow atlas-override/1:lineage_id=L; changes include change_id, target_table, full target_key, field or identity_binding, expected_original, replacement, decision, reason, origin, claims[], and supersedes_change_id where supplied. Original guard equality includes type; NULL is not wildcard. Research replacements require sourced claims/locators; operational identity-only binding may have empty research claims. Reject wrong guard, unsupported field/type, duplicate change IDs, competing unsuperseded changes, cycles. Explicit supersession topology then lexical path/change_id, not last-wins. Preserve original and losing claims. No override proposed/accepted here.

Incomplete refresh is not deletion. Carry omitted existing office/event/result/source/tier/evidence/alias rows with exact origin bytes and include them in effective fingerprint. Logical-path collision retains old input under inherited/sha256/<oldhash>/<original_input_path>; raw keeps original path/hash, typed FKs use inherited path. Effective classifications cover effective office set without unresolved conflict. Initial import cannot invent carried rows. Withdrawal or replacement-event additions require accepted explicit evidence, not absence or the RS gap note.

Every active Bosnia row joins its own(L, R). Preserve unrelated Europe/LatAm/NZ rows, selected release IDs and citations; never cite latest publication receipt as a record's release. Separate durable ledger, same-FS consistent backup/staging, WAL checkpoint, fsync/atomic rename and receipt recovery follow Field Map and checklist. No importer/SQLite/publication/VPS/UI execution.
