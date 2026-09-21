# Estonia identity rules — DRAFT

Main pinned to `f7b5c81ebd39f1774edea7cde5b4155031d92647`. New source research lineage **country-package-estonia**, office/event namespace **cdd-observatory-v1**. Atlas IDs below are deterministic proposed documentary identifiers grounded in official bodies/codes, not a claim that Estonia supplied Atlas IDs. All exact office/event/result/geography/source/proceeding/date vectors are included in `Estonia_Identity_Vectors.json`.

## Stable identities

C(x) is compact UTF-8 JSON, recursively sorted object keys, Unicode unescaped, arrays ordered, finite numbers only. H(x)=SHA-256(C(x)). `key(prefix,x)=prefix+"-"+H(x)[0:24]`. These use the pinned identity primitive; the country-specific natural keys are explicitly fixed here.

| Entity | Exact identity |
|---|---|
| Country | `estonia`, code `EE` |
| Municipal council | `EE-M` + exact four-digit EHAK code + `-C`; preserve leading zeroes |
| National / supranational | `EE-RIIGIKOGU`, `EE-PRESIDENT`, `EE-EP`, each evidenced in official election returns |
| Geography | `EE` or `EE-M`+ EHAK; no inferred county office |
| History key HK | `office_id + "::" + cycle`, where cycle is `KOV_YYYY`, `RK_YYYY`, `EP_YYYY`, `PRES_YYYY` |
| Event | `key("event",["estonia",N,HK])` |
| Presidential proceeding | `key("proceeding",[N,office_id,HK,"ballot-"+sequence])` |
| Result | `key("result",[N,office_id,HK,proceeding_id or "main",candidate_source_id])` |
| Candidate source ID | Official registration number as string for KOV/RK/EP; exact supplied candidate name within presidential ballot. No cross-cycle person identity inferred. |
| Source | `"estonia--"+key("url",exact source URL)` in source namespace L |
| Date | `"date-"+H([N,ownerType,ownerId,slot])`: event/event_id/election; office/office_id/next; proceeding/proceeding_id/ballot |
| Evidence | `"ev-"+H([record_key,["estonia",L,source_id],occurrenceIdentity,claim_kind])` |
| Unresolved token | `"unres-"+H([record_key,occurrenceIdentity,original_token])` |

`occurrenceIdentity` is the whole original locator excluding source_id: source byte hash + relative path + namespace-stripped one-based XPath, or HTML table/row/heading locator; include archive path/member/hash where applicable. Do not hash a bare filename as the occurrence. Exact URLs keep case/query/encoding; no aggressive canonicalization. XML bytes keep namespaces; XPath evaluation strips namespace names only in a read-only tree.

## Typed record keys

`record_key="rec-"+H(tuple)` with tuple:

- country: `["country","estonia"]`
- geography: `["geography","estonia",geography_id]`
- office: `["office",N,office_id]`
- event: `["event",N,office_id,HK]`
- proceeding: `["proceeding",N,office_id,HK,proceeding_id]`
- result_row: `["result_row",N,office_id,HK,result_row_id]`
- source: `["source","estonia",L,source_id]`
- input: `["input",L,R,input_path]`

The sparse `record_locator` for a result leaves proceeding_id **NULL**, even though the actual result_row may refer to a proceeding. This follows unchanged DDL. A proceeding locator carries its own proceeding ID. Each resolved evidence source must exist in the exact country/namespace/source tuple. A missing known FK fails closed; unresolved original tokens go to `unresolved_evidence` against a real entity/input, never a invented source.

## History, code changes and ballot overlap

One body per source EHAK code is a documentary identity; it is not an assertion that boundaries never changed. Different codes with similar names remain separate until primary legal binding exists. Historical offices remain active records with office_status=historical, not deleted or withdrawn. No successor links are supplied. The exact code alias namespace is `ehak:volikogu`; cycle-specific roster occurrences are retained in `register-source-rows.json`. A future proven reused code needs a reviewed identity/crosswalk revision with prior identity preserved.

Local detailed files are authoritative candidate rows once per office/cycle. Tallinn's eight districts are components of one Tallinn council. 2013/2017 summary files, list totals, party votes and station/municipal breakdowns are nonadditive retained input. For RK2015/2019, the election-result file includes only qualifying parties' candidates: use **district candidate totals** in VOTING_RESULT_IN_COUNTIES to cover all candidates, and join elected/reserved flags only by exact candidateRegNumber with vote equality checked. For RK2023/EP2024 use both party and independent candidate blocks. For EP2014/2019 use allCandidates once, not electedCandidates plus allCandidates.

Presidential cycles are one event each with separate ballot proceedings. Never add different rounds' votes into one denominator. The 1992 popular first ballot and Riigikogu conclusion share a cycle, with different franchises retained; modern indirect ballots are not a popular result universe. Subsequent statutory ballot maps to runoff, renewed Riigikogu election in 2016 to repeat; original institution, sequence and day remain raw. No further certification proceeding is invented.

## Release and attempts

Fingerprint `f28f6134f30031e3b012d9631d69bbf548d18a0bb1e66728d5b097dc9f0ba7ce` and candidate release `country-package-estonia--sha256-f28f6134f30031e3b012d9631d69bbf548d18a0bb1e66728d5b097dc9f0ba7ce` are documentary vectors, not executed ingest. `Estonia_Input_Inventory.json /hash_inputs` gives every exact effective descriptor, draft tier bytes, empty override set, adapter/method/schema versions and pinned DDL hashes. Hash only this canonical object, not ZIP/report bytes or run time. Inputs are sorted by path. No recursive inventory/self hash. Approval changes tier bytes and therefore fingerprint/release; unchanged reimport yields a new attempt_id but the same release_id. Corrected evidence changes release, while unchanged natural-key identities survive.

Attempt logging is a future durable sibling ledger, started before staging, terminal status after publication. Publication is a set of lineage/release pairs. Every citation joins the row's own L/R, never the newest receipt. Incomplete refresh retains omitted prior offices/events/results with omission diagnostics; it does not manufacture deletion or approve new evidence. Future accepted overrides require exact target key, original guards, claims/origin and explicit decision; unresolved conflict withholds publication of the affected claim, never silently chooses a numeric alternate.

No legacy Estonia public IDs were supplied for this new pack. No rewrite of other country aliases, LatAm citations or Mexico overrides is authorized.
