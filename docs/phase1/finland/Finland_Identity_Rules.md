# Finland identity rules — DRAFT

Pinned main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Country `finland`; namespace `N=cdd-observatory-v1`; lineage `L=country-package-finland`. The stable IDs below are **authored documentary keys for evidenced offices**, not falsely presented as upstream office IDs. Original official codes, names, source bytes and locators are preserved. No legacy Finland public office ID was supplied to replace.

## Canonical identities

`C(x)` = compact UTF-8 JSON, recursively sorted object keys, original array order, unescaped Unicode, finite numbers. `H(x)=SHA256(C(x))`; `K(prefix,x)=prefix+'-'+H(x)[:24]`. These use the pinned Atlas normalize.ts primitive with explicit Finland adapter tuples.

| Entity | Exact rule |
| --- | --- |
| Municipal council | FI-M<three-digit Statistics Finland municipality code>-C; includes 16 Åland councils with the same official code system. |
| Wellbeing council | FI-HVA<two-digit official county code>-C. |
| National / Åland / EP | FI-EDUSKUNTA; FI-PRESIDENT; FI-AX-LAGTING; FI-EP. |
| Geography | FI country; FI-AX Åland; FI-M<code>; FI-HVA<code>. No invented regional parent for historic mainland municipalities. |
| History key | office_id::source_cycle_year::source_cycle_year::ordinary; source year stays year precision. |
| Event | K(event,[finland,N,history_key]). |
| Proceeding | K(proceeding,[N,office_id,history_key,round,string(source_round_code)]). |
| Result | K(result,[N,office_id,history_key,proceeding_id_or_null,identity_token]). |
| Source | finland-- + K(source,[exact_URL,exact_POST_request_or_null]). |
| Date | date-+H([N,owner_type,owner_id,slot]); event/ballot or office/next. |
| Record locator | rec-+H([entity_kind,...PK components]). |
| Evidence | ev-+H([record_key,[finland,L,source_id],[input_path,json_pointer_or_locator],claim_kind]). |
| Unresolved | unres-+H([record_key,[source_locator],original_token]). |


Record tuples: country `[finland]`; geography `[finland,gid]`; office `[N,oid]`; event `[N,oid,HK]`; proceeding `[N,oid,HK,qid]`; result_row `[N,oid,HK,rid]`; source `[finland,L,sid]`; input `[L,input_path]`. The complete vectors enumerate all rows and exact authored array pointers. No row-position or random ID is used for office/event/result identities.

Result tokens: `StatFin:kvaa:party:<code>`, `StatFin:alvaa:party:<code>`, `StatFin:evaa:party:<code>`, `StatFin:euvaa:party:<code>`, `StatFin:pvaa:candidate:<code>`, `ASUB:party:<code>`. Source category codes remain table-scoped and are not global party IDs. Numeric corrections retain result identities. Statistical combined categories remain combined; no invented disaggregation.

## Joins, history and exceptions

StatFin municipality codes in 14z7 include a reporting-prefix component. The last three digits are the municipality code printed in its label; `identity-crosswalk.json` preserves the full original code/year. An observation with a positive source total identifies an election-cycle return; all-null cells are not invented elections. Do not treat current constituency placement as historical parent geography. Municipalities absent from the independently sourced 2026 classification remain historical offices; no exact abolition date or successor edge is inferred. Same-code legal continuity and pre-1976 predecessors remain a research gate.

Votes and seats join by **same election year + body code + source party code**, never label similarity alone: municipal 14z7↔152l (2012 onward); county 14y4↔153i (2022/2025); Eduskunta 13sw↔13t4 (2003 onward). Source aggregate/technical party definitions remain in raw metadata. Absent seat records remain NULL even when votes are positive.

Åland uses ÅSUB cycle years, not shifted mainland series. Municipal seats VA006 and votes VA011; Lagting seats VA007 and votes VA012. Shared party codes join directly. Three explicit within-source aliases are documented from the corresponding labels: S↔Soc (Ålands Socialdemokrater), G↔Gröna (Gröna på Åland), Utan grupp↔Utan politisk gruppering (unaffiliated grouping). The latter is a statistical category, not a fabricated party. Original labels and both codes remain source claims. No accepted global party mapping is produced. Source totals are reconciliation only, never extra party rows.

Åland observations inside the StatFin municipal 1976–1988 series describe preceding-year elections. They remain original retained bytes, excluded from normalized events/results to avoid date distortion and overlap. No unsupported 1975/1983 event is invented from those columns. ÅSUB municipal seat-only cycles 1991/1995 survive with NULL votes.

Presidential 14db first/second rounds belong to **one ordinary event per year**, with eleven sourced proceedings over six cycles. Source codes 98/99 are valid/invalid ballot totals, excluded from candidate results. No second round is created in 2018 because no candidate values exist. Rounds are not additive vote vectors. EP 14h8 is retained for future elected-member reconciliation; it is not a second party-results load or a basis for fabricated complete seat totals.

Helsinki has a single municipal council and no separate county election. Åland has one Lagting and 16 municipal councils, not a mainland wellbeing county. County 2022 elections and the 2023 service transition are separate facts; no new 2023 election is fabricated. Historical dates stay source-year precision; next-election metadata uses only explicitly published ministry days. Åland next dates stay unknown.

## Release identity, retained inputs and publication

Candidate fingerprint `f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a`; candidate release `country-package-finland--sha256-f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a`. Inventory `/hash_inputs` contains every effective source/research/tier hash, accepted overrides (empty), adapter/method/schema versions and original DDL hashes. Reports, vectors, ZIP, SHA256SUMS, attempts, execution time and unrelated lineages are excluded. No release or attempt is executed here.

Unchanged effective inputs → fresh durable attempt_id, same release_id. Accepted tier bytes, corrected source claims or versions → new fingerprint. Tier acceptance is not inferred from these drafts. Future `atlas-override/1` changes require full namespaced target key, expected_original, replacement, source claims, origin and explicit acceptance. No executable override supplied.

Incomplete refresh does not delete offices, histories, results or evidence dependencies. Carry omissions into the effective retained-input inventory until a reviewed explicit withdrawal. Each office/source cites its own `(lineage_id,release_id)` publication member; a Finland-only attempt leaves LatAm/NZ/Europe members unchanged.

Publication protocol for future CI: append durable attempt in the independent ledger; prepare same-filesystem staging; transactionally validate full FKs and publication set; checkpoint WAL; fsync database and parent directory; atomic rename; finalize receipt/ledger consistently. Any failure keeps the last good database serving and the failed attempt durable. Importer/SQLite/VPS/UI and filesystem publication execution are **Not run**.
