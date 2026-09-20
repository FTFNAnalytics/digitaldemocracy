# Poland identity rules — Prompt AC

Draft, main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. Namespace **cdd-observatory-v1**; country `poland`; lineage **country-package-poland**. No prior public Poland office IDs were supplied. IDs below are explicitly **authored deterministic Atlas identifiers**, not claims that PKW issues those full strings. Original PKW codes, candidate UUIDs where supplied, committee signatures and GUS IDs remain evidence/crosswalks.

## Canonicalization and hashes

`C(x)` is compact UTF-8 JSON, recursively key-sorted objects, preserved array order and Unicode, no NaN/Infinity. `H(x)=SHA256(C(x))`; `K(prefix,x)=prefix + '-' + H(x)[0:24]`, matching the pinned stable/digest/key contract. Identity tuples contain strings/integers/null, not ambiguous float serialization. `Poland_Identity_Vectors.json` covers every office/geography/event/proceeding/source and links every result preimage in `result-identity-vectors.jsonl.gz`.

## Office and geography keys

| Source identity | Atlas office_id | Geographic tier proposal |
|---|---|---|
| PKW six-digit gmina code, elected council | `PL-<code>-C` | municipal |
| Same gmina, directly elected executive | `PL-<code>-X` | municipal |
| PKW six-digit powiat code, elected county council | `PL-<code>-P` | regional, category review |
| PKW six-digit województwo code, sejmik | `PL-<code>-V` | regional |
| PKW Warsaw district code, district council | `PL-<code>-D` | other, category review |
| National body | `PL-SEJM`, `PL-SENAT`, `PL-PRESIDENT` | national→national_context |
| Polish EP delegation | `PL-EP` | other |

Preserve all leading zeroes. Geography is `PL-<code>` or country `PL`; council/executive share the gmina geography. GUS BDL’s 12-character unit IDs retain their original namespace. Its positions 3–4, 8–9 and 10–11 (1-based) supply the six PKW territorial digits; validate exact whole-country equality, and require `years` contains 2026 for current status. Kind4/5 components are parts of a mixed gmina, not extra councils. Historical kind/name versions do not automatically mint new offices or successor links. GUS current municipality names/kinds and PKW source-year body titles are separate fields.

City-counties have one municipal council. Warsaw has one city council/executive plus 18 separately sourced elected district councils; no elected district executive is fabricated. Appointed voivodes and indirect/cabinet offices are absent. Ostrowice `PL-320304-C` and `PL-320304-X` remain historical active research records, with no successor FK.

## Events, rounds and results

The ordinary local `history_key` is `office_id::source_cycle_year::ordinary::whole-office`. The immutable source cycle token remains the year even when separate primary calendar evidence adds a precise polling day. National history keys retain their initial source cycle token shown in the vectors (year or supplied full date); do not re-key on a later date clarification. Special keys are `office_id::source_day::special|repeated::wojtburmistrz-pkw-ID|radygmin-pkw-ID`. Original source index IDs remain in raw_json. `event_id=K('event',['poland',N,history_key])`.

One ordinary event per office/cycle. Council constituencies/list rows/precinct totals are result scopes, not extra body events. `proceeding_id=K('proceeding',[N,office_id,history_key,'round',round_number])`; first-round and runoff are separate proceedings, with `supersedes_id=NULL`. Do not add the runoff as another ordinary election or erase first-round returns.

`result_row_id=K('result',[N,office_id,history_key,proceeding_id_or_null,identity_token])`. The complete exact token is stored in each result and vector. Council/parliament tokens comprise `candidate`, source district, list/position/ballot-number slots and original candidate name. Where PKW2014 supplies a candidate UUID, the executive token preserves it directly. PKW2018 executives use original full candidate name plus source committee signature. Presidential2020 territorial tokens include region and original candidate-column name. Do not replace any token with source row number. Source rows are evidence locations, not unstable identities.

2014/2018/2024 candidate exports are the result authority at the chosen granularity. Other copies/aggregates are reconciliation material only. Multi-constituency percentage vectors and first-round/runoff vectors have separate denominators. No national percentage or margin is computed. Missing scalar→NULL/unknown, explicit zero→0/zero. Mandate T/Tak→1, N/Nie→0, blank→NULL. In first-round rows a non-award applies to that ballot, not a claim that a runoff candidate lost the final election. 2019 parliamentary fraction-labelled shares are retained raw with typed NULL and a named unit-review hold.

## Sources and evidence

`source_id='poland--'+K('source',[exact_acquired_URL,request_or_null])`; source namespace is L. The source catalogue maps each retained artifact to its exact hash/URL. XLS/XLSX locators use exact sheet + 1-based row; CSV uses exact ZIP member + 1-based parsed record (quoted embedded newlines remain one record). Binary PKW locators use message type, field/index and original index ID, accompanied by retained official decoder JS and decoded documentary JSON. No script/macro executes.

| Entity kind | record_key tuple after kind |
|---|---|
| country | `[poland]` |
| geography | `[poland, geography_id]` |
| office | `[N, office_id]` |
| event | `[N, office_id, history_key]` |
| proceeding | `[N, office_id, history_key, proceeding_id]` |
| result_row | `[N, office_id, history_key, result_row_id]` |
| source | `[poland, L, source_id]` |
| input | `[L, release_id, input_path]` |

`record_key='rec-'+H([kind,...tuple])`. `date_id='date-'+H([N,owner_kind,owner_id,slot])`: event owner/event_id/slot election; office owner/office_id/slot next. Proceeding dates remain raw because DDL has no proceeding date column; source date claims may separately link a real research_date.

`evidence_id='ev-'+H([record_key,[poland,L,source_id],[input_path,locator_or_pointer],claim_kind])`. A resolved source must exist under the full FK. Unresolved gap token uses `unres-'+H([record_key,[gap_path,token],token])`; it targets a real country/office/event locator and has no fabricated source FK. Preserve competing claims and withhold the conflicted typed field pending accepted resolution. Sparse record_locator columns must match DDL shape: result_row locator has result_row_id, but proceeding_id=NULL even when result_row has a proceeding FK.

## Release, refresh and publication

Candidate fingerprint `186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944` is `H(Inventory.hash_inputs)`. Candidate release **`country-package-poland--sha256-186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944`** is documentary, not published. Effective source/research/tier bytes, accepted overrides(empty here), adapter/method/schema versions and both DDL hashes determine the fingerprint. Exclude documentation, identity vectors, ZIP/manifest, attempt ID, timestamps and other lineages. Derived gzip files have zero mtime/no filename headers for reproducible bytes.

Unchanged re-import creates a new durable attempt_id and the same lineage release. A corrected source/accepted override or accepted tier file changes the release while unchanged record IDs persist. Unresolved conflicts preserve all claims; no invented accepted override. An incomplete refresh must carry omitted records and their source inputs forward or fail pending explicit disposition; absence is not deletion.

Input record locators have country_id=NULL and all entity slots NULL except input_path, as required by the sparse DDL. Ledger status begins as started (not running).

Each record cites its own `(lineage_id,release_id)` publication member. A Poland re-import leaves LatAm/NZ/other Europe rows and releases unchanged. Future publication uses a consistent SQLite backup to same-filesystem staging, complete validation/deferred FK checks, WAL checkpoint, close/fsync and atomic rename; failure keeps last good publication and writes the failed attempt outside discarded staging. All such execution is Not run here.
