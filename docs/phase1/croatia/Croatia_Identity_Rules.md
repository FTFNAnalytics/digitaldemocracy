# Croatia identity rules — Prompt W

Pinned `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. N=`cdd-observatory-v1`; country=`croatia`; ISO=HR; L/source namespace=`country-package-croatia`. Office IDs are authored Atlas identifiers from evidenced DIP bodies/codes, **not DIP-issued office IDs**.

C(x)=compact UTF-8 JSON, recursively sorted object keys, arrays preserved, Unicode unescaped, no NaN; H=SHA256(C); K(prefix,x)=prefix+'-'+H(x)[:24]. This matches pinned normalize.ts stable/digest/key for the string/integer tuples. Never hash vote amounts, rank or runtime clocks into identity.

| Entity | Exact rule |
|---|---|
| County geography | HR-Z + two-digit zupanija.code, parent HR. |
| Local geography | HR-G + four-digit gradOpcina.code, parent from codetop. Source alias1333 uses HR-Z21; no duplicate Zagreb pair. |
| Council | geography_id + -C; types06/08. For06 only county codetop defines office; municipal menu projections do not. |
| Executive ticket | geography_id + -E; types15/17. Joint deputy candidates stay raw on same ballot. |
| Independent deputy | geography_id + -D- + H(group)[:12]. group=lowercase parenthesized source electorate label with whitespace collapsed; literal hrvatski narod if source says hrvatskog naroda. Electorate, not mutable slot21/25/19/27, identifies office. |
| National bodies | HR-SABOR, HR-PRESIDENT, HR-EP; one body each. |
| Local HK | office_id + ::lokalni:<source-year>. All rounds shareHK. |
| President/EP HK | office_id + ::predsjednik:<year>::whole-body or ::euparlament:<year>::whole-body. |
| Sabor HK | HR-SABOR::parlament:<year>::constituency:<three-digit-code>:ballot:<type>. XII electorate types13/23/33/43/53/63 only as supplied; no phantom sixth group in2000. |
| Event | K('event',['croatia',N,HK]). |
| Proceeding | K('proceeding',[N,office_id,HK,'round',sequence_no]); executive/deputy/President. 1 first_round,2/3 runoff. No presumed supersession. |
| Result token | Direct candidate or Sabor minority: candidate:+exact source name. Pre2015 Sabor lists: legacy-list:+H(original CSV fields20 through third-last inclusive), full nomination fields excluding rank/votes/share. Other lists: source-code:+jedinstvenaSifra (local 2017 field41; EP 2013/14 field28; Sabor2015/16 field34). |
| Result ID | K('result',[N,office_id,HK,proceeding_id-or-NULL,identity_token]). All preimages in vectors. |
| Source ID | croatia--+K('source',[exactURL,NULL]); content SHA is separate version identity. |
| Date | date-+H([N,owner_kind,owner_id,slot]); event/event_id/election; future office/office_id/next. No next-date rows now. |
| Evidence | ev-+H([record_key,['croatia',L,source_id],[input_path,archive_entry-or-NULL,locator],claim_kind]). |
| Unresolved | unres-+H([record_key,['data/research/croatia/research-gaps.json',token],token]). |

## Sparse record locators

record_key=rec-+H([kind,...natural-key]): country→[croatia]; geography→[croatia,gid]; office→[N,oid]; event→[N,oid,HK]; proceeding→[N,oid,HK,pid]; result_row→[N,oid,HK,rid]; source→[croatia,L,sid]; input→[L,release_id,input_path]. Only real entities get locators. Only geography fills geography_id; only proceeding fills proceeding_id (**result_row locator leaves that slot NULL**, even though the result itself binds to a proceeding); only source fills source namespace/ID; only input fills input_path and sets country_id NULL. Other unrelated slots NULL. Missing unresolved source_locator=C([]), never SQL NULL.

## Historical identities and corrections

Eleven historical rows are source-era independent deputy identities, not eleven proven abolished municipalities. No guessed territorial successors. Candidate-name/nomination-text corrections that change identity material require a reviewed crosswalk preserving the old public ID, never silent rekeying. CW preserves each exact source-year ballot/territory/label. Identical party abbreviations do not identify identical lists. Supplemental/special ballots must receive their own evidenced event token when future bindings are accepted.

## Fingerprint and publication

Inventory hash_inputs includes sorted effective original-source/derived-research files, draft tier hash, accepted overrides=[] and adapter/method/schema versions plus both unchanged DDL hashes. Reports/vectors/ZIP/manifests, clocks/attempt IDs and other lineages are excluded. H(hash_inputs) is candidate fingerprint; release=L+'--sha256-'+fingerprint. It is not published; draft tiers still block publication.

Identical reimport→same release, new actual attempt UUID. Accepted source/override/tier/version change→new release, stable natural IDs. Incomplete refresh never deletes omitted office/history/result: carry entities plus original retained sources/tiers or fail pending disposition. Carried rows use new active Croatia release and raw prior-release provenance; carried bytes participate in fingerprint. Citations join each office's own lineage/release, not latest receipt. Unrelated publication members remain unchanged. Ledger uses started/succeeded/failed and survives discarded staging. No runtime rows authored.
