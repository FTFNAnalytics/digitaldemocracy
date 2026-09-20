# Norway identity rules — Prompt AA / DRAFT

Pinned main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Country `norway`; namespace `N=cdd-observatory-v1`; lineage `L=country-package-norway`. All office keys are **authored documentary identifiers for sourced bodies**, not falsely described as official upstream Atlas IDs. Original codes, suffixes, names, dates, change records and raw bytes are preserved.

## Exact identity contract

`C(x)` is compact UTF-8 JSON, recursively sorted object keys, original array order, unescaped Unicode and finite numeric values. `H(x)=SHA256(C(x))`; `K(prefix,x)=prefix+'-'+H(x)[:24]`. These documentary tuples use the pinned Atlas hashing primitive; no importer has been implemented.

| Entity | Exact rule |
| --- | --- |
| Municipal council | NO-M<canonical SSB municipality code>-C. Keep meaningful vintage suffixes such as u; do not strip them. Canonical means only the sourced alias rule below. |
| County council | NO-F<two-digit SSB county code>-C. Current and historical county codes remain separate; no code alias inferred through merger and later split. |
| Borough committee | NO-B<six-digit SSB borough code>-C, only 030101–030115 supported by Oslo official roster. Sentrum, Marka and unknown statistical areas do not create offices. |
| National / special | NO-STORTING; NO-SAMEDIGGI; NO-LONGYEARBYEN-C. |
| Geography | NO; NO-M<code>; NO-F<code>; NO-B<code>; NO-LONGYEARBYEN. Oslo county geography may exist without a second elected office. |
| History key | office_id::source_cycle_year::source_cycle_year::ordinary. |
| Event | K(event,[norway,N,history_key]). One observed office/cycle, not another event for each measure or reporting component. |
| Result | K(result,[N,office_id,history_key,null,identity_token]). |
| Source | norway-- + K(source,[exact_URL,exact_POST_request_or_null]). |
| Date | date-+H([N,owner_type,owner_id,slot]); event/ballot or office/next. |
| Record locator | rec-+H([entity_kind,...PK components]). |
| Evidence | ev-+H([record_key,[norway,L,source_id],[input_path,json_pointer_or_locator],claim_kind]). |
| Unresolved | unres-+H([record_key,[source_locator],original_token]). |


Result tokens are `SSB:municipal:party:<code>`, `SSB:county:party:<code>`, `SSB:national:party:<code>` and `SSB:sami:party:<code>`. Codes remain series-scoped; no global party or coalition mapping is inferred. Numeric corrections do not change the result key. Current next-date metadata does not create an extra prospective event. No proceeding identity is instantiated because no distinct legal round/repeat protocol was acquired.

Record tuples: country `[norway]`; geography `[norway,gid]`; office `[N,oid]`; event `[N,oid,HK]`; result_row `[N,oid,HK,rid]`; source `[norway,L,sid]`; input `[L,input_path]`. The complete identity vectors enumerate every office, geography, event, result and source with exact array pointers. No random or array-position research IDs.

## Historical code and reform policy

`identity-crosswalk.json` binds each observed municipal source code/year and every municipal metadata register code to its office. Metadata-only historical versions remain offices without invented events. For an official Klass change, only **different old/new code + exactly equal old/new official name + one old-to-new and one new-from-old edge on that change date** qualifies as a renumbering alias. Follow the eligible chain to the latest code, retaining every edge's hash/pointer. Do not collapse merger/split graphs, name-similar municipalities, or an old municipality into a surviving municipality merely because only one edge was returned. Same-code changes remain source claims and legal-continuity gates.

`reform-source-claims.json` retains all acquired official municipal/county changes, including 2020 and 2024, with `atlas_successor_asserted=false`. None becomes an inferred successor FK. **537 historical records mean sourced historical jurisdiction versions, not a count of independently established legal councils were abolished.** Ambiguous earlier renumberings and same-code boundary continuity stay open. Current municipality ID-set equality is independently checked against the 2026 SSB register; old source versions never replace current offices.

An observed positive party-vote vector admits a historical municipal/county cycle. Every municipality explicitly named in SSB municipal-election metadata is retained as a register record even if all acquired party-return cells are zero; those records get no invented event. Source-wide zero categories and all-zero non-existent jurisdiction/year cells stay raw; they do not invent a contested list or election. For an admitted cycle, positive vote categories are normalized; a positive-seat source claim also admits a national/Sami row even when its vote claim conflicts. Known zero-seat values remain zero; absent seat joins stay NULL.

## Sources, joins and conflict rules

Municipal 01180 votes join 04813 seats only on exact source municipality code/year/party. County 01181 municipal reporting components are summed by their original two-digit county prefix within the same source year/party; source members and every cell remain in evidence. Those are **derived county totals**, not claimed certified returns. 04809 seats join exact county/year/party. No Oslo fylkesting is created, and no municipal-election votes are used for county results. County geography/recount reconciliation is a named hold.

National 08092 party votes/shares join 08219 seats summed over disjoint female/male categories at whole-country level. Sami 05924 whole-country votes/shares join 05923 elected-member sums: the 13 non-VAL historical districts for 2005; the seven VAL districts from 2009. Never combine both district systems. A missing component makes the aggregate NULL; no imputed zeros. The 2025 Sami party `98d` conflict is preserved as disputed, with zero votes and one seat as separate source claims. No alternative name/code is automatically substituted.

Every evidence object resolves its retained `input_path` and byte hash to an actual source row, then its JSON pointer and dimension tuple or HTML text locator. A missing resolved source/FK fails closed. An explicitly unavailable citation or research question creates unresolved_evidence on a real target locator, never a fabricated source row. Sparse record_locator fields obey the DDL: geography_id only on geography targets; source keys only on source targets; input_path only on input targets; proceeding_id NULL for all present result targets.

## Release and publication identity

Candidate tier SHA `dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0`. Candidate fingerprint **`d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd`**; candidate release **`country-package-norway--sha256-d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd`**. These are documentary candidates, not published releases. The inventory's hash_inputs includes all effective retained research/source/tier bytes, empty accepted-overrides list, adapter/method/schema versions and exact DDL hashes. Exclude reports/vectors/ZIP/manifest, attempt IDs, retrieval execution time and unrelated lineage releases.

Unchanged effective input → fresh durable attempt_id, same release_id. Accepted tier-byte changes, source corrections or version changes → new fingerprint. Future `atlas-override/1` requires full namespaced target_key, field, expected_original guard, replacement, reason, origin, source claims and Justin acceptance. No executable override is included.

Incomplete refresh ≠ delete: carry omitted office/event/result rows and their source dependencies into the effective inventory until explicit reviewed withdrawal. Historical rows remain active. An office/source cites its own `(lineage_id,release_id)` publication member; Norway-only re-import does not change LatAm/NZ or other Europe members.

Future publication protocol: durable attempt ledger before staging; same-filesystem staging; transactional full-FK and release-set checks; WAL checkpoint; fsync database and directory; atomic rename; receipt and durable ledger reconciliation. Failure leaves last good database serving and preserves failed attempt. All importer/SQLite/VPS/UI/publication execution: **Not run**.
