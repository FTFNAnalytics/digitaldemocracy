# Netherlands identity rules

Accepted 2026-09-19 against review pack main `b293da99b97a8ae008d87ee2e57210cde0678004`. Namespace N=`cdd-observatory-v1`; country=`netherlands`, code=`NL`; source namespace and lineage L=`country-package-netherlands`. These are documentary vectors, not an executed importer. New research under data/research/netherlands; no legacy frozen-office identifiers exist to recover. The IDs below are **documentary Atlas identifiers derived from real sourced codes/bodies**, not a claim that an authority issued the NL-prefixed strings. Justin accepted all 501 draft offices; Hilversum/Wijdemeren successor binding, named historic gaps, and ~147 focused-tier reviews stay open.

## Exact identity grammar

- Municipal council: `NL-GM` + CBS numeric code padded to 4 digits + `-C`; geography `NL-GMdddd`. Current membership is exact CBS 2026 roster. Historical codes retain the same grammar; never bind by a similar name or successor municipality.
- Province: `NL-PV` + CBS 2 digit province code + `-PS`; geography `NL-PVdd`. No provincial mayor/commissioner election is invented.
- Waterboard: `NL-WS-` + exact source Waterschap value with the leading `AB2023_` removed + `-AB`; geography same without `-AB`. Preserve original EML domain token in raw; future renamed tokens require reviewed crosswalk, not silent office creation.
- National bodies: `NL-TK`, `NL-EK`, `NL-EP` for the sourced named institutions, sharing `NL-NATIONAL` geography. EP is the Netherlands electoral delegation, not a second Dutch chamber. Senate is indirect.
- Island and electoral-college bodies: `NL-` + source RegioCode (`O9001`,`O9002`,`O9003`,`O1999` as actually supplied) + `-ER` or `-KC`; shared geography `NL-O…`. Colleges are not duplicate island councils. Non-resident electorate has no invented physical geometry.
- Rotterdam: `NL-GM0599-WR-` + exact official result-URL final component. Amsterdam: `NL-GM0363-SDC-` + exact named district, or `NL-GM0363-BC-Weesp`. Body name tokens are frozen in vectors; future display rename does not rekey. Official OSV district codes remain raw, not a fabricated national CBS code.

C(x)=compact recursively key-sorted UTF-8 JSON as normalize.stable; H(x)=full lowercaseSHA 256(C(x)); K(prefix,x)=prefix+'-'+H(x)[0:24]. This matches 24 hex repository key semantics. Complete inputs and outputs are in Netherlands_Identity_Vectors.json; no random research IDs.

HK=`office_id+'::'+year+'::'+source_date_label`. Label is exact authored ISO day or year, not padded. Event ID=`K('event',['netherlands',N,HK])`. PK=(N,office_id,HK); unique=(N,event_id). Year-only identities are retained aliases if later day-level evidence refines the same event; **do not create a second event**. Preserve the original event ID/public link, add a scoped crosswalk and update the date claim under a reviewed correction. A genuinely separate special/repeat event requires primary identity evidence; this baseline has no proceedings.

Result ID=`K('result',['netherlands',N,HK,source_row_id])`. Long-form source token=`list-`+supplied list number; when absent, use exact list label. A missing number on the seat metric may join its vote metric only when `(RegioCode,exact LijstNaam)` resolves to exactly one nonempty source number. EML uses `list-`+AffiliationIdentifier/@Id (even when RegisteredName blank). Aggregate CSV/XLSX token=`label-`+exact source list label. Rotterdam token=`candidate-`+printed candidate number. Never combine names across offices/events. Original source row indices are locators, not identities; label-key corrections require alias preservation.

Source ID=`K('source',['netherlands',exact_successful_URL])`; PK=(netherlands,L,source_id). Member data cites its original ZIP source plus member name and CSV/XPath locator. Archive hash is not silently substituted with member hash; inventory records both. No fake source IDs, publishers, global party IDs or catalogue remapping. Source results have no accepted party-family mapping; raw labels/numbers remain distinct.

Geography names/parents follow sourced codes; shared national geography is not three places. CBS municipality→province parents are explicit, Amsterdam/Rotterdam subunits attach to their municipality; overlapping waterboards and non-resident electorate have NULL parent. No geometry or boundary-effective date inferred.

## Record/date/evidence identities

Record key=`'rec-'+H([kind,...PKcomponents])`: country[netherlands]; geography[netherlands,gid]; office[N,oid]; event[N,oid,HK]; result_row[N,oid,HK,rid]; source[netherlands,L,sid]; input[L,input_path]. record_locator fills only that kind’s DDL target shape; other target columns NULL. Evidence ID=`'ev-'+H([record_key,input_path,locator,claim_kind])`; unresolved ID=`'unres-'+H([record_key,original_token,input_path,locator])`.

Date ID=`'date-'+H([N,owner_type,owner_id,slot])`; event owner_type=election_event/owner_id=event_id/slot=ballot; office owner_type=office/owner_id=office_id/slot=next. For year-only histories month/day=NULL. Municipal 2030-03 is month precision/day=NULL. Sourced upcoming dates are expected, not guaranteed; historical called means supplied ballot date, not legal certification. No prospective event rows are created from next-date metadata.

## Release, refresh, overrides and publication

Inventory /hash_inputs pins every effective source and authored research file plus tier, overrides=[] and adapter/method/schema/canonicalization/DDL versions. `fingerprint=H(hash_inputs)`; R=`L+'--sha256-'+fingerprint`. Draft-tier candidate `country-package-netherlands--sha256-63eb6c893dfd62029b9c2b400075a8beddde4675a454d4621743eaf930fb8e48` is documentary. An accepted tier changes bytes and therefore creates a different release candidate. **No importer runs in this landing; the accepted-tier fingerprint is not published.** Exclude output Markdown, vectors, inventory self-hash, ZIP, timestamps, attempts, operator, mainSHA and unrelated lineages from the input hash.

Unchanged effective inputs → sameR/newattempt-UUID. Source corrections → newR, stable public office/event/result IDs where same entity. No INSERT OR REPLACE or omission-driven deletion. An incomplete refresh retains omitted previous offices, histories, results, tiers and evidence; include inherited byte dependencies in effective fingerprint (collision paths inherited/sha 256/<hash>/<oldpath>). Only explicit reviewed withdrawal/supersession can change record_state.

Future atlas-override/1 inputs require named targets, exact original guards, preserved origin/claims and Justin acceptance; no executable override is authored here. A broken resolved source FK fails closed. Intentionally unresolved citation/binding gets unresolved_evidence on a real input/office/event locator, never a fabricated FK or silent downgrade of an error.

Netherlands rows cite their own(L,R). Netherlands refresh preserves every other publication member including Belgium, early Europe, latin-america-fe5e91689def and country-package-new-zealand. The latest receipt is not a citation owner. A failed staging attempt leaves the last good publication set and durable failed-attempt record intact. No database operation ran.
