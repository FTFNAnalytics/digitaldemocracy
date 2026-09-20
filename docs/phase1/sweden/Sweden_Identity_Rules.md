# Sweden identity rules — DRAFT

Main pin `94b22e8662b4d304263bef67628765f5377fd9da`. Country `sweden`, namespace `N=cdd-observatory-v1`, lineage `L=country-package-sweden`. Documentary Atlas IDs identify source-evidenced bodies; these IDs are **not claimed to be published Swedish office IDs**. Original Valmyndigheten/SCB codes and names remain in the register and crosswalk. No existing Sweden public IDs were supplied for replacement.

## Exact identities

`C(x)` is compact UTF-8 JSON with recursively sorted object keys, preserved array order, unescaped Unicode, finite numbers and no whitespace. `H(x)=SHA256(C(x))`; `K(prefix,x)=prefix+'-'+H(x)[:24]`. This is the pinned normalize.ts canonical/key primitive with an explicit Sweden adapter tuple; no random research IDs.

| Entity | Rule |
| --- | --- |
| Municipal office | SE-K<four-digit Val/SCB code>-C |
| Svedala predecessor | SE-K1263-PRE1976-C for SCB 1263/1973 only |
| Regional office | SE-R<two-digit current region code>-C |
| Historical landsting | SE-LT<original SCB code>-C:11L,12LG,14LG,15L,16L |
| National / specialized | SE-RD, SE-EP, SE-SAM |
| Geography | Same SE-K/SE-R/SE-LT prefix without final -C; SE shared national geography; predecessor vintage retained |
| History key | office_id::source_cycle_year::date.value::event_kind; exact authored E.history_key is authoritative |
| Event | K(event,[sweden,N,history_key]) |
| Result | K(result,[N,office_id,history_key,null,raw.identity_token]) |
| Source | sweden-- + K(source,[exact_url,request_JSON_or_null]); POST query is part of identity |
| Date | date-+H([N,owner_type,owner_id,slot]); event/ballot or office/next |
| Record | rec-+H([entity_kind,...PK components]) |
| Evidence | ev-+H([record_key,[sweden,L,source_id],[input_path,json_pointer_or_locator],claim_kind]) |
| Unresolved | unres-+H([record_key,[source_locator],original_token]) |


Record PK tuples: country `[sweden]`; geography `[sweden,gid]`; office `[N,oid]`; event `[N,oid,HK]`; result_row `[N,oid,HK,rid]`; source `[sweden,L,sid]`; input `[L,input_path]`. `Sweden_Identity_Vectors.json` enumerates every office/geography/event/result/source tuple and original authored array pointer. Full FK is always namespaced, never bare event/year.

Result tokens: SCB `['SCB',scope,party_code]` where scope K/R/RD/EP; live Val `['VAL',partikod]` (or exact source label only if code absent); Sami archive `['VAL-SAMI-ARCHIVE',abbreviation]`. Source party codes are not cross-election person/party-family IDs. A scalar correction never changes the result ID. Historic SCB and current Val party schemes are not silently merged. URL `_S` vs `_P` versions remain distinct source claims; a refresh replaces an event's selected representation under guarded claims, not additive result copies.

## Historic code and date bindings

`identity-crosswalk.json` binds all SCB council codes. Current municipality codes may be harmonized across old county transfers; the cube's full region notes are retained. Code `20LG` is **current Region Dalarna**, so never classify a row historical merely because its code has G. The five specifically evidenced predecessor landsting are separate historical offices.

SCB states Bara and Svedala formed a new Svedala municipality in 1976. Keep Bara 1229 and Svedala 1263/1973 as distinct predecessors. The source does not supply a precise dissolution day; none is invented. Current council continuations retain boundary/split notes and do not claim unchanged geographic polygons. Pre1973 abolished councils remain an explicit research gap, not a claim of zero.

SCB source years1979/1985/2002/2010/2018 sometimes identify later repeats. Explicit mappings: Hallsberg 1861→1980-06-01; Borgholm0885 and Åre 2321→1986-03-16; Orsa 2034→2003-03-16; Västra Götaland 14L→2011-05-15; Falun 2080→2019-04-07. HK retains source_cycle_year and actual sourced day. Örebro 2010 includes a2011 partial repeat within a mixed cycle total: keep year 2010 and the qualification, never fabricate a second additive vector. Båstad 2014 ordinary results are retained as other; the2015-05-10 repeat is a distinct anchor with missing results. Original ordinary vectors replaced by SCB are not reconstructed.

SCB years without a day stay year-precision. Next ordinary 2030 stays year-precision despite a general legal scheduling rule; no computed polling day is inserted. EP 2029 year and Sami 2029-05-20 day are metadata only, outside the alert window. All offices remain.

Sameting May 2025 was annulled and October 2025 was the repeat. The official narrative controls those labels where payload valdatum is absent and valklass misleadingly says ordinary. Both claims are preserved. The May vector is disputed/other; it is not selected current history. Pure referendums and council-selected executives have no office/event IDs here.

## Releases, omissions, overrides and publication

Candidate fingerprint `75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75`; candidate release `country-package-sweden--sha256-75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75`. Exact preimage is Inventory `/hash_inputs`: effective source/research/tier input hashes, accepted overrides(empty), adapter/method/schema versions and pinned migration hashes. Exclude report/vectors/ZIP/checksum manifest, attempt/time and other lineages. Source-capture provenance is retained; execution time is not release identity.

Unchanged inputs create a new durable attempt_id and the same release_id. An accepted source correction or accepted tier bytes changes the fingerprint. No attempt/release has actually been loaded. Future override objects must use `atlas-override/1`, full target keys, expected_original guards, replacement, claims, provenance and explicit human acceptance. No executable override is in this pack.

Incomplete refresh does not delete omitted offices, histories, results or their retained evidence. Carry them into the effective input inventory until an explicit accepted withdrawal/supersession; retain historical citations. Sweden rows cite their own `(L,release_id)` member, never the last global publication receipt. Preserve Europe/LatAm/NZ/Mexico publication members byte-for-byte when unrelated. Durable ledger → same-FS staging → transaction/FK checks → WAL checkpoint → fsync → atomic rename; any failure leaves last good publication serving.

- [ ] Justin accepts Sweden identity and historical binding policy.
- [ ] Justin accepts Sweden draft tiers separately.
