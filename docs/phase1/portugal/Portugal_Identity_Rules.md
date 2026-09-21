# Portugal identity rules — Prompt AD

Main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. N=`cdd-observatory-v1`; L=`country-package-portugal`; country_id/slug=`portugal`; country_code=PT. These are **authored Atlas IDs grounded in official source codes/bodies**, not a claim that CNE issued Atlas office IDs.

C(x)=compact UTF-8 JSON, recursively sorted object keys, original array order, Unicode unescaped, no NaN. H(x)=SHA256(C(x)). K(prefix,x)=prefix+'-'+H(x)[:24]. These string/integer tuple hashes match pinned normalize.ts stable/digest/key. Identity never includes votes, rank, attempt clocks or random numbers.

| Entity | Exact documentary rule |
|---|---|
| Country/region geography | PT; PT-AC (Açores); PT-MA (Madeira). No mainland pseudo-region office. |
| Current municipality | PT-M+four-character CNE code, including leading0. Parent from evidenced island grouping, otherwisePT. |
| Current parish | PT-F+exact six-character CNE DTMNFR, including alphanumeric suffixes. Parent municipal prefix. Do not integer-convert0302FA. |
| Historical parish | If source code and NFC-uppercase/whitespace-collapsed source name equal current2025 result-map identity, reuse current geography. Otherwise PT-F+source code+'-H'+H([source code,normalizedname])[:12]. This is a held source-era identity, not a certified abolition. |
| Historical municipal alias | Unknown code with no unique sourced current-name binding uses PT-M+sourcecode-prefix+'-H'+H([prefix,normalizedname])[:12]; current linkNULL. One such municipality label in this pack. |
| Local offices | geography_id + -AM/-CM/-PCM/-AF/-JF/-PJF for sourced legal body/mandate. No AF for current37plenary jurisdictions. Historic no-AF plenary similarly retained. |
| National/regional | PT-AR, PT-PR, PT-EP, PT-AC-AL, PT-MA-AL. Regional government president is not an authored direct office. |
| Local history key | office_id+'::AL:'+sourcecycleyear. Source-only/no-numeric-return rows remain unresolved, no completed event. |
| AR history key | PT-AR::AR:YYYY:Cnn (CNE1…22 constituency code). One parliamentary office,22 ballot contexts per cycle; no additive national aggregate. |
| Other history keys | PT-PR::PR:YYYY; PT-EP::PE:YYYY; PT-AC-AL::ALRAA:YYYY; PT-MA-AL::ALRAM:YYYY. |
| Event | K(event,[portugal,N,history_key]); FK includes(N,office_id,history_key). |
| Proceeding | K(proceeding,[N,office_id,HK,round,sequence_no]);2026 PR sequences1/2 only, one event. Dates preserved as claims/raw because DDL proceeding has no date column. |
| Result | K(result,[N,office_id,HK,proceeding_id-or-NULL,identity_token]). Local token='column:'+literal header, scoped to ballot/year; AR/EP/regional='list:'+original label; PR='candidate:'+exact published candidate name. |
| Source | portugal--+K(source,[exactretrievalURL,NULL]); original archive URL owns member evidence. Never invent URL for unresolved token. |
| Date | date-+H([N,owner_kind,owner_id,slot]); event/proceeding slot=election; future office slot=next only if real sourced next claim. |
| Crosswalk | cne:local-map:YYYY + C([source code,sourceorgan,originalmemberpath,1-basedrow])→office. Wrong/reused source codes are isolated by row, not rewritten in originals. No existing Portuguese Observatory alias supplied. |

For mutable display-name corrections after an accepted import, preserve existing IDs through an explicit accepted crosswalk/override; do not recompute identity silently. The current candidate/name tuples are draft bootstrap identities, all included in complete vectors.

record_key=rec-+H([kind,...naturalkey]): country→[portugal]; geography→[portugal,gid]; office→[N,oid]; event→[N,oid,HK]; proceeding→[N,oid,HK,pid]; result_row→[N,oid,HK,rid]; source→[portugal,L,sid]; input→[L,release_id,input_path]. Sparse record_locator fills only its entity slots: result locator proceeding_idNULL even when result_row.proceeding_id is set. Evidence=ev-+H([record_key,[portugal,L,source_id],[input_path,archive_entry-or-NULL,locator],claim_kind]). Unresolved=unres-+H([record_key,[documentedpath,locator],original_token]); absent locator retainedas[] rather than fabricatedFK.

## Electoral identity and historical binding

308 PCM rows represent winning CM-list heads, not308 additional ballots. AF votes remain on AF; JF/PJF mandate linkage is metadata.37 citizens-plenary parishes have JF/PJF, no AF; outcomes need minutes. AM elected-member returns do not multiply its ex-officio AF-president component. Official regional legislatures are distinct; no appointed regional government head gets a popular contest.

2009 Óbidos and2017 Aljustrel published code anomalies retain exact source guards and unique named-municipality binding. Historic parish variants remain held until current alias or legal successor is evidenced. `office_status=historical` in this documentary pack means source-era identity, and `registry_qualified=0` prevents treating it as an accepted distinct abolished jurisdiction. Do not sum these rows as legal merger counts. Complete source-row crosswalk is provided; historical event IDs occur once even when several source files describe them.

## Release, correction, incomplete refresh

Inventory/hash_inputs is the exact effective documentary research/tier/retained-byte descriptor list plus adapter `atlas-portugal-full-register/1`, method `atlas-preserve-evidence/1`, schema `atlas-master/1`, unchanged DDL hashes and acceptedoverrides=[]; H produces candidate fingerprint and `L--sha256-<H>`. ZIP/report/manifest/vector/runtime hashes are excluded from this effective-input fingerprint to avoid self-reference. No release is published here. An accepted tier edit changes hash; unchanged re-import creates a new durable attempt and the same release. A corrected source/effective override changes the lineage fingerprint, preserves entity IDs, and retains predecessor claims/bytes. Never edit a frozen input to bypass a guard.

A refresh omission carries the old office/history/evidence into effective inputs or fails; absence alone does not withdraw. Europe/LatAm/NZ/Mexico release ownership remains unchanged. All citations join office's own(lineage_id,release_id), never latest publication receipt. No importer/SQLite/VPS/UI execution.
