# Ireland identity rules — Prompt AB / DRAFT

Main `0482d5ac79f7f27565ddd6c71394259a3737c989`. Country `ireland`, ISO `IE`, namespace `cdd-observatory-v1`, lineage `country-package-ireland`. New research, separate from frozen Europe extracts. Office IDs below are **authored stable documentary keys for evidenced offices**, not invented institutions or falsely claimed official office IDs. Original source jurisdiction UUIDs/names are retained.

## Exact identity tuples

`C(x)` = compact UTF-8 JSON with recursively sorted keys, preserved arrays and Unicode; `H(x)=SHA256(C(x))`; `K(prefix,x)=prefix+'-'+H(x)[:24]`. This uses the pinned Atlas canonical/key primitive with a country-specific documentary adapter. Do not call Albania's hard-coded country helpers for Ireland. All identity/fingerprint preimages in this pack use strings, integers, booleans and null; no floating-point serialization ambiguity.

| Entity | Rule |
| --- | --- |
| Current council | IE-LA-<exact CSO G0503 UUID>-C. |
| Historical town/borough | IE-HIST-<uppercase ASCII hyphenated statutory place name>-T-C or -B-C. Unicode original remains name; no collision exists in this sourced 80-row set. |
| Six pre-merger councils | IE-HIST-<uppercase hyphenated exact City/County name>-C; source section 9 wording retained. No collapse into modern combined councils. |
| National/special | IE-DAIL; IE-SEANAD; IE-PRESIDENT; IE-EP; IE-LIMERICK-MAYOR. |
| Geography | IE; IE-LA-<CSO UUID>; IE-HIST-<historical name slug>. Council and direct Limerick mayor share one source geography. Historical town and county names do not collapse into each other. |
| History key | office_id::date_value::event_kind::contest_scope. Ordinary cycles use whole-office; Dáil 2026 specials use Dublin Central or Galway West. Date_value retains actual day/month/year precision. |
| Event | K(event,[ireland,N,history_key]). |
| Result | K(result,[N,office_id,history_key,null,identity_token]); no proceeding instantiated. |
| Source | ireland--+K(source,[exact_URL,request_or_null]). Original archived source URL remains source identity. |
| Date | date-+H([N,owner_type,owner_id,slot]); event/ballot or office/next. |
| Locator | rec-+H([entity_kind,...PK components]). |
| Evidence | ev-+H([record_key,[ireland,L,source_id],[input_path,json_pointer_or_locator],claim_kind]). |
| Unresolved | unres-+H([record_key,[source_locator],original_token]). |


Slug conversion for historical authored keys: Unicode NFKD, ASCII transliteration by discarding combining/non-ASCII characters, lowercase, replace non-alphanumeric runs by hyphens, trim, then uppercase. Never regenerate an existing ID after a name correction: preserve the accepted ID and add an evidenced alias/crosswalk. First acquisition has no legacy Irish Atlas IDs supplied. Complete office/geography/event/result/source vectors list exact current keys and source array pointers. Existing other-country namespaces do not collide with IE-prefixed office IDs.

## Exact result tokens and source overlap

- Local official books: `local:<exact table/LEA label>:candidate:<exact source candidate label>`. One event per council/date; LEAs scope candidates without adding offices. Source2009 Cork council N/S/W subdivisions bind the one Cork County Council; Dun Laoghaire-Rathdown split heading is rejoined. Accent/punctuation-only council-name matches are recorded in the crosswalk. First-count tables reconcile to printed totals and candidate counts.
- Roscommon2019: `roscommon2019:<MD>:<FULL_NAME>`; Wicklow2019: `wicklow2019:<Local_Electoral_Area_Name>:<Candidate_Id>`. Candidate_Id is only local to its electoral area. Later counts enrich raw, never add duplicate result rows.
- Dáil 2024: `dail2024:<sheet constituency>:<source candidate label>`. Candidate first preferences from sheet columnC; repeated total baselines and party summaries remain reconciliation-only. No capitalisation-based winner inference.
- Dáil 2016/2020: `housing:<Constituency Number>:<Candidate Id>`. Later-count Votes are retained raw; typed votes/share unknown. Explicit Elected yields seats/elected_flag1; Excluded yields0; blank remains unknown. Source replacement characters are not silently repaired.
- Dáil 2002/2007/2011: `housing-national-party:<source party header>`, one national Total-row vector per event. Published elected seat totals can exclude automatic returns; do not force them to constitutional chamber size.
- Seanad 2025: `seanad2025:<panel/university label>:<candidate label without printed preference-ranking suffix>`. Read **Number of Votes**, not the adjacent Value column (panel vote value×1000). All seven vectors independently reconcile to their valid polls. Do not add their denominators as one popular-national electorate. NUI/TCD2025 retained despite current Higher Education constituency reform.
- Dáil 2026: `bye:<Dublin Central|Galway West>:<source candidate label>`. Same office/day, distinct history keys. They are two real special contests, not two ordinary general elections.
- Limerick: `limerick2024:<candidate label>`; first count only. Final count remains original evidence, not a new ballot.
- Presidential: `presidential:<source candidate header>`, source national Total first-count row. Later transfer CSVs retained only.

For every token, values and source row positions are **not** identity components. Names are identity components only where the source supplies no stable candidate ID; a name correction must explicitly retain/crosswalk the old result identity. Future improved exact dates must crosswalk to the admitted event key rather than silently duplicating a year-only event. The complete raw count matrices and PDFs remain immutable retained inputs.

## Locator and evidence contract

Record tuples: country `[ireland]`; geography `[ireland,gid]`; office `[N,oid]`; event `[N,oid,HK]`; result_row `[N,oid,HK,rid]`; source `[ireland,L,sid]`; input `[L,input_path]`. Sparse locator fields follow DDL: geography_id only for geography target; source keys only for source target; input_path only for input target. A result locator's proceeding_id remains NULL.

Every evidence object has exact retained path+SHA and JSON pointer, CSV row, XLSX sheet/cell, PDF1-based page/candidate/column, or HTML section. Empty JSON pointer means the root value; it is not an unresolved source. PDF text line is supplementary to the authoritative page/name/column. Broken resolved source lookup fails closed. Named gaps in research-gaps.json create unresolved_evidence against real country/office locators, never fake source FKs. No party-family mapping, successor FK or legal proceeding is invented.

## Fingerprint, refresh and publication

Tier SHA `0683410a3e3b8f1c1bc5b69df0793fd5bbba524658556a51ca76d3aeb7ae3470`. Candidate fingerprint `b6145edbe4ab2c4ba5b9e41d340edb515a9a8acecb12f125b3d868d8a100c5fc`. Candidate release `country-package-ireland--sha256-b6145edbe4ab2c4ba5b9e41d340edb515a9a8acecb12f125b3d868d8a100c5fc`. These are documentary identities, not a published release.

Fingerprint input = inventory hash_inputs: all effective original source and derived research bytes, tier bytes, accepted overrides (empty), adapter/method/schema versions and pinned DDL hashes. Reports, vectors, ZIP, manifest, attempt IDs, execution timestamps and other lineages are excluded. Any accepted tier correction changes the effective hash. New unchanged attempt_id, same release_id; changed effective input yields new release. Runtime attempt UUID is not a research ID.

Incomplete refresh never deletes omitted offices/history. Carry omitted rows and required source dependencies into the effective inventory until an explicit reviewed withdrawal. Historical records remain active. Future override contract is atlas-override/1: full namespaced key, field, expected_original guard, replacement, reason, origin, claims and Justin acceptance. No executable override included.

Publication set retains each unrelated lineage release/rows unchanged. Ireland office citations join their own `(L,R)`; no join through latest publication_receipt. Future publication uses durable ledger, consistent backup, same-filesystem staging, deferred-FK validation, WAL checkpoint, closed connections, fsync and atomic rename. Failures leave last good publication serving. No importer, SQL execution or publication has run here.
