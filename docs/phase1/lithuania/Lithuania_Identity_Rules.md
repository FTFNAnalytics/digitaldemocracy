# Lithuania identity rules — Prompt AH (DRAFT)

Pin `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33`; namespace N=`cdd-observatory-v1`; lineage/source namespace L=`country-package-lithuania`; country=`lithuania`, ISO=`LT`. These are **new documentary Atlas IDs**, not claimed upstream state codes. No production IDs were changed. Existing bridges have no supplied Lithuania aliases; do not silently remap another lineage.

## Canonical primitives

C(x)=compact UTF-8 JSON, recursively lexicographically sorted object keys, arrays in original order, Unicode preserved, no NaN/Infinity. H(x)=lowercase SHA-256 of C(x). key(prefix, x)=prefix+`-`+first 24 hex of H(x), matching pinned `scripts/import/normalize.ts`. All identity and release preimages here contain strings/integers/booleans/null, so Python/JavaScript float serialization differences do not enter these hashes. Full `rec-`, `date-`, `ev-`, `unres-` hashes use 64 hex. Treat a collision as fatal; never randomly suffix it.

| Entity | Exact deterministic rule | Evidence / persistence rule |
|---|---|---|
| Municipality geography | `LT-`+key(`lsa`, exact municipality website URL in frozen LSA row) | URL bytes preserved, including http/https/trailing slash; not normalized away. URL is a source alias, not legal code. |
| Council office | municipality geography ID+`-C` | One per 60 sourced jurisdiction rows. |
| Direct mayor office | municipality geography ID+`-M` | Distinct from council; temporary acting occupant never changes office identity. |
| National offices | `LT-SEIMAS`, `LT-PRESIDENT`, `LT-EP` | Explicit country-qualified body identifiers grounded in institutional sources. |
| National geography | `LT` | Parent of municipal geographies; all national offices use it. |
| History key HK | exact office_id+`::`+cycle token | `SEI2008/2012/2016/2020/2024`, `EP2004/2009/2014/2019/2024`, `PRE2019`, `SAV2019`. No date or numeric value in key. |
| event_id | key(`event`,[`lithuania`, N, HK]) | Office namespace carried in preimage and SQL event/office keys. |
| proceeding_id | key(`proceeding`,[N, office_id, HK,`ballot-`+sequence]) | Sequence from sourced round, not arbitrary row order. |
| result_row_id | key(`result`,[N, office_id, HK, proceeding_id or `main`, candidate_source_id]) | EP exact code; other published event-scoped label. No votes/share/seats in ID. Labels are documentary source keys until accepted upstream-code crosswalk exists. |
| source_id | `lithuania--`+key(`url`, exactURL) | Full source PK(`lithuania`, L, source_id). Aliases with different URLs remain separate sources even if bytes match. |
| record_key | `rec-`+H([entityKind,...components]) | office:[N, O]; event:[N, O, HK]; result_row:[N, O, HK, resultID]; proceeding:[N, O, HK, proceedingID]; geography:[country, geoID]; source:[country, L, sourceID]. |
| research date | `date-`+H([N, ownerType, ownerID, slot]) | event/election; proceeding/ballot. Values/precision can refine without rekeying event. No next-date rows supplied. |
| evidence_id | `ev-`+H([record_key,[country, L, sourceID], occurrenceIdentity, claim_kind]) | occurrenceIdentity is exact origin object excluding source_id; claim kind identity/geography/date/result/provenance. |
| unresolved_id | `unres-`+H([record_key, occurrenceIdentity, original_token]) | Real target; preserve conflicting claims. Never convert broken known FK into unresolved. |

Country record key=`rec-`+H([`country`,`lithuania`]); retained-input record key=`rec-`+H([`input`, L, R, input_path]). Source row locator is canonical JSON of derived_path,0-based derived_json_pointer and full origins. Result sparse locator uses its resultID and **NULL proceeding_id**; the result table separately carries its proceeding FK. This follows DDL sparse-target shape.

## Release identity and attempts

Inventory `hash_inputs` is the complete recipe: sorted effective package/artifact/tier descriptors(path, kind, SHA, byte count), sorted overrides(empty), adapter=`atlas-lithuania-full-register/1`, method=`atlas-preserve-evidence/1`, schema=`atlas-master/1`, canonicalization=`atlas-c14n/1`, hash=`sha256`, both exact DDL hashes. Fingerprint=H(hash_inputs); R=L+`--sha256-`+fingerprint. Draft R is documentary only. ZIP/doc generation times and attempts are excluded; source raw timestamps change R only if source bytes change.

Candidate R: `country-package-lithuania--sha256-921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918`. Tier draft SHA:`43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39`. Approval changes tier bytes and therefore effective fingerprint; do not pretend the approved release equals this draft candidate.

Unchanged import: same R, new separately durable `attempt-<UUID>`; new attempt never becomes release identity. Corrected input/accepted guarded override: new R, same unaffected office/HK/result identities. Publication is a set of lineage releases; Latvia/LatAm/NZ/Europe citations join through their own member and remain unchanged during Lithuania-only work.

## Temporal identity and incomplete refresh

The initial exact LSA URL→office bindings are frozen in `register-bindings.json` and source aliases in `identity-crosswalk.json`. Future name/website changes must consult these persisted IDs; do not regenerate existing offices from a new website URL. Official territorial-code enrichment needs an evidenced accepted crosswalk, not string similarity. No predecessor/successor/abolition edges are supplied.0 historical-only records is an unresolved research gate, not a closed historical universe.

Omission from a later partial package never deletes offices, results or histories. Withdrawals/mergers require explicit sourced temporal action, original-identity preservation and acceptance. Historical first-round/runoff claims remain attached to one cycle; by-election/repeat cycles require exact call identity and never overwrite ordinary history silently. The 2015 direct-mayor introduction and 2023 institutional role change are recorded as mechanism history; they do not authorize invented predecessor or deputy offices.

## Full vectors and overrides

`Lithuania_Identity_Vectors.json` enumerates all 123 offices,61 geographies,30 events,25 proceedings,130 results,53 sources and 55 date identities. No importer code is included. An accepted future override must specify atlas-override/1 change_id, target_table, full target_key, field, expected_original, replacement, decision, reason, origin, claims. Draft proposals cannot execute. Preserve old claims; disallow clamping, rescaling, automatic alternate selection and unchecked NULL coercion. Named semantic uncertainty is not an executable approval.
