# Czechia identity rules — Prompt V

Pinned `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. Draft specification, no imported rows. N=`cdd-observatory-v1`; country=`czechia`; L/source namespace=`country-package-czechia`. These authored stable Atlas IDs derive from evidenced bodies; ČSÚ does not supply the strings `CZ-M…-C` as native office identifiers.

## Canonical identity

C(x)=compact UTF-8 JSON with recursively sorted object keys, preserved arrays, Unicode unescaped, no nonfinite numbers. H(x)=SHA256(C(x)); K(prefix,x)=prefix + '-' + first 24 hex characters of H(x). These match pinned normalize.ts stable/digest/key for the string/integer tuples used here. Never hash localized display formatting or runtime timestamp into a natural ID.

| Entity | Exact rule |
|---|---|
| Municipal / borough / Prague office | `CZ-M` + KODZASTUP padded left to six digits + `-C`; preserve original token in raw. One council per code; RZCOCO OBEC and OBVODY precinct/district rows do not mint offices. |
| Regional assembly | `CZ-K` + CIS_KRZAST padded left to two digits + `-C`. Distinct namespace from municipal codes and national electoral KRAJ IDs. |
| National / EP | `CZ-PS`, `CZ-SENAT`, `CZ-PRESIDENT`, `CZ-EP`; fixed body identifiers evidenced in source. |
| Geography | `CZ`, `CZ-M<code>`, `CZ-K<code>`; exact G file; parents only evidenced NADRZASTUP or NULL. |
| Municipal HK | office_id + `::kv:` + source DATUMVOLEB; 2026 exact endpoint token `20261009`. |
| Regional / Chamber / EP HK | office_id + `::kz:<year>`, `::ps:<year>`, `::ep:<year>` respectively. Year token identifies source cycle, not invented polling day. |
| Senate HK | `CZ-SENAT::senat:<DATUMVOLEB>::obvod:<OBVOD>`; one scoped contest within one chamber. |
| Presidency HK | `CZ-PRESIDENT::prez:<year>`; rounds are proceedings. |
| Event | K('event',['czechia',N,HK]). |
| Proceeding | K('proceeding',[N,office_id,HK,'round',sequence_no]); 1 first_round / 2 runoff. No automatic supersession. |
| Result | K('result',[N,office_id,HK,proceeding_id-or-NULL,identity_token]). Municipal token=`district:<COBVODU>::list:<OSTRANA>`; national/regional/EP token=`list:<KSTRANA or ESTRANA>`; Senate/President=`candidate:<source ordinal>`. |
| Source | `czechia--` + K('source',[exact URL,NULL]); file hash is content/version identity, not a made-up source-catalogue number. |
| Date | `date-`+H([N,owner_kind,owner_id,slot]); owner event/event_id/election or office/office_id/next. |
| Evidence | `ev-`+H([record_key,['czechia',L,source_id],[input_path,archive_entry,locator],claim_kind]). |
| Unresolved | `unres-`+H([record_key,['data/research/czechia/research-gaps.json',token],token]). Missing source_locator is C([]), not SQL NULL. |

Full office/geography/event/source vectors are in Czechia_Identity_Vectors.json; every result preimage is in Czechia_Result_Identity_Vectors.jsonl.gz. XML locator paths ignore namespaces only when resolving; namespace URI is still retained in original XML. CSV logical record numbering includes header as1; multiline quoted text does not create extra records. Archive bytes and member path are retained.

## Record locator keys and sparse slots

`rec-`+H([kind,...natural-key]) where kind country→['czechia']; geography→['czechia',gid]; office→[N,oid]; event→[N,oid,HK]; proceeding→[N,oid,HK,pid]; result_row→[N,oid,HK,rid]; source→['czechia',L,sid]; input→[L,R,input_path]. No party_mapping rows.

Only geography locators fill geography_id. Only proceeding locators fill proceeding_id; **result_row locator proceeding_id=NULL** even when the result row binds to a proceeding. Only source locator fills source namespace/ID. Only input locator fills input_path; its country_id and entity slots are NULL. Other entity locators use their exact DDL-required natural-key slots. Unresolved tokens never become fake source FKs.

## Historical continuity and ownership

Thirteen absent-current source codes remain historical identities, not a declaration of thirteen abolished bodies. Historical name/code variants have no guessed successor. Complete CW maps exact source code/name to authored office ID; no alias for another country's office or new public release is invented. Prague is one dual-function city/region office; Senate scoped ballots do not create 81 body duplicates. Local popular executive offices=0; direct President=1.

Refining an event year/date does not change source-cycle HK. Corrected source editions retain IDs and evidence of original claims; 2017 Chamber NSS and 2023 President NSS versions are selected explicitly. Raw candidate archives, precinct and alternate encodings must not double-count typed results. PROCHLSTR hold never deletes a result ID.

## Release and attempt

Inventory hash_inputs includes all effective retained research/source/tier bytes, empty accepted override list, adapter/method/schema versions and both unchanged DDL hashes. Sort descriptors by input_path; exclude reports, vectors, ZIP, checksum manifests, attempt ID, wall clock and unrelated lineages. Fingerprint=H(hash_inputs); candidate release=L+'--sha256-'+fingerprint. Current documentary fingerprint `3f4571dd4ac0eebbb7518de0ba08a0a2ac96a306be92bc2ee266559d13d8c3ec` is **not published**.

Unchanged inputs→same release, new actual attempt UUID. Changed accepted source/tier/override/version→new release, same natural office/event/result IDs. Incomplete refresh does not delete omitted offices/events/results; carry old rows AND retained inputs/sources or fail until explicit sourced disposition. Carried entities take the new active Czech release_id, while raw provenance records the prior release and retains original source bytes; include all carried effective inputs and tiers in the new fingerprint. Czech re-import preserves every non-Czech release member and citation ownership. Runtime attempts live in the durable separate ledger; publication is the set of lineage release IDs, not the latest attempt or receipt.
