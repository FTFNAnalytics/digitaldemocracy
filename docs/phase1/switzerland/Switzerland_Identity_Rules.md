# Switzerland identity rules

Accepted 2026-09-19 against review pack main `b4dcf6d891ed83a7db5b7d6eb8808671d6eec000`. N=`cdd-observatory-v1`; L=`country-package-switzerland`; country=`switzerland`, code=`CH`. No live/public Swiss Atlas IDs were supplied for this new research, so the following are explicit documentary IDs derived from official codes, not claimed authority-issued office IDs. Justin accepted the evidenced subset of 2,816 draft offices; 308 commune-executive gaps, thin historic/merger archive, 1,938 parliament caveats, and disputed-result notes stay open. Full-register certification remains OPEN.

## Canonical keys

C(x) is compact, recursively key-sorted UTF-8 JSON, preserving array order and source string Unicode; H(x)=SHA-256(C(x)); K(prefix,x)=prefix + '-' + first24 lowercase hex of H(x). Identity tuples contain strings/integers/null only. Full digest keys use all64 hex. `lib/atlas/identity.ts` and pinned DDL remain authoritative for canonicalization and publication, with Switzerland-specific tuple definitions below.

| Entity | Exact rule |
| --- | --- |
| Country | switzerland; record_key=rec-+H([country,switzerland]) |
| Country geography | CH |
| Canton geography | CH-<source two-letter canton code> |
| Commune geography | CH-GM<official numeric BFS code padded to at least4digits> |
| Office | CH-FED-NR / CH-FED-SR; CH-CT-<canton>-L/E; CH-GM<code>-L/E/P. L legislature, E executive, P separately evidenced popular presidency. No role is generated without body evidence. |
| History key | office_id::source_Wahljahr::component; component body for local/cantonal, source canton for federal constituent, CH only for separate NR national aggregate. |
| Event | K(event,[switzerland,N,history_key]) |
| Proceeding | K(proceeding,[N,office_id,history_key,source_round_sequence]) |
| Result | K(result,[N,office_id,history_key,proceeding_id_or_NULL,raw.identity_token]) |
| Source | switzerland-- + K(url, exact_source_URL); namespace L |
| Research date | date-+H([N,owner_type,owner_id,slot]); event owner event_id/ballot, office owner office_id/next |
| Release | L--sha256- + H(hash_inputs); candidate only, never a publication claim |
| Attempt | Fresh attempt-UUID for every future invocation, even unchanged bytes; none created in this pack |


`Switzerland_Identity_Vectors.json` enumerates every authored office, geography, event, result, proceeding and source, including hash preimages where hashed. PKs remain namespaced: office(N,oid); event(N,oid,HK), event_id uniqueness within N; result(N,rid); source(country,L,sid). Record keys: country `[country,country_id]`; geography `[geography,country_id,gid]`; office `[office,N,oid]`; event `[event,N,oid,HK]`; proceeding `[proceeding,N,oid,HK,qid]`; result `[result_row,N,rid]`; source `[source,country_id,L,sid]`; input `[input,L,input_path]`, all prefixed `rec-` plus full H.

Evidence ID = `ev-`+H([record_key,[country_id,L,source_id],[input_path,locator],claim_kind]); unresolved ID = `unres-`+H([record_key,[source_locator],original_token]). Reject duplicate occurrence tuples rather than introduce random salts. Record locators use the DDL's sparse target shape; a result locator does not also populate a proceeding target column.

## Historic and representation boundaries

BFS geography-record admission dates are not office establishment dates. Keep every historical source code and all annual boundary/name/canton observations. A code transfer between cantons does not rekey the commune. A new code is not automatically the predecessor's office: retain old offices; accept a successor crosswalk only with merger evidence. Historical-status holds do not claim exact abolition dates. Municipal body institutional continuity remains an explicit gap where a current commune had an older parliament no longer positively recorded.

Rolling BFS sheets are observations of the same office/Wahljahr, not additional elections. Same metric values coalesce with all provenance; differing numeric values produce NULL/unknown for that metric and disputed evidence, retaining original claims. A later footnote/party label refinement needs a reviewed crosswalk, not deletion. Party headings strip only source footnote digits; original headers remain raw. No FDP/LPS or CVP/BDP/Mitte historical family merge is asserted.

Federal event components do not create 26 chamber offices. National Council CH aggregate and 26 constituency components describe overlapping coverage and must not be summed. States party-seat summaries and candidate-round votes are different representations. A runoff is a proceeding of one cantonal cycle. Missing day-level event dates stay year-only even where a round has an exact day in raw. No decimal fictitious-voter statistic is coerced into integer votes.

Government snapshot numbers and older city tables lacking Wahljahr stay retained_input/retained observations, not fabricated completed contests. Government explicit Wahljahr anchors have role other, unknown kind, and no projected decisive results. No popular event is generated for an executive with unresolved direct/indirect mode. All unknown source columns, footnotes, sex breakdowns and comparison markers survive in raw and source bytes.

## Fingerprint and publication coexistence

Candidate fingerprint `24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6`; candidate release `country-package-switzerland--sha256-24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6`. Inputs are the exact inventory descriptors (path,kind,hash,byte_count), draft tier bytes, empty override list, adapter/method/schema versions and both pinned DDL hashes. No report, ZIP, manifest, attempt UUID or runtime clock is hashed. Accepted tier/override bytes necessarily produce a new candidate release. Correction reuses identities and records old claims; it does not rewrite source bytes.

Unchanged re-import: new attempt, identical L release. A Switzerland-only refresh changes only Switzerland's publication member; Albania/other Europe/LatAm/NZ citations still join their own `(lineage_id,release_id)`. Incomplete refresh is not deletion: retain omitted rows and their prior input dependencies until an explicit reviewed withdrawal/supersession. Future effective-input inventory must include those inherited dependencies, so its fingerprint describes the actual complete staged state.

The separate durable ledger begins before staging. Future publication uses same-filesystem staging, all gates and foreign-key checks, WAL checkpoint, file and directory durability, and atomic rename. Failure leaves the last good master and other lineages serving. No execution, approval or publication was performed here.
