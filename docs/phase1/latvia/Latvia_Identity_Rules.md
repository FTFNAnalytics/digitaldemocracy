# Latvia identity rules — DRAFT

Pinned main `f7b5c81ebd39f1774edea7cde5b4155031d92647`. New lineage `country-package-latvia`; office/event namespace `cdd-observatory-v1`. IDs are proposed Atlas documentary keys grounded in retained official bodies and source tokens. They are not claimed to be Latvian official territorial IDs. No pre-existing public Latvia Atlas IDs were supplied.

## Canonical keys

C(x)=compact UTF-8 JSON with recursively sorted object keys, ordered arrays, Unicode unescaped and finite numbers. H(x)=SHA-256(C(x)); key(prefix,x)=prefix+"-"+H(x)[:24]. Country-specific inputs below are fixed; the pinned identity primitive remains unchanged. All emitted keys are enumerated in Latvia_Identity_Vectors.json.

| Entity | Exact rule |
|---|---|
| Country | latvia; code LV |
| Current local council | LV-LOCAL-2021- + exact CVK2025 URL jurisdiction slug + -C; Madona uses 2025 epoch explicitly |
| Historical 2017 council | LV-LOCAL-2017- + key(cvk, exact XML DepartmentResultModel/Id string) + -C; only Type2 municipal records |
| Historical 2021 Madona/Varakļāni | LV-LOCAL-2021-madonas-novads-C and LV-LOCAL-2021-varaklanu-novads-C |
| National bodies | LV-SAEIMA, LV-PRESIDENT, LV-EP |
| Geography | LV for national jurisdiction; municipal office_id with trailing -C removed |
| HK | office_id + :: + cycle token PV2017/PV2021/VRD2021/RD2020/PV2025/SVYYYY/EPYYYY/PRESYYYY |
| Event | key(event,[latvia,N,HK]) |
| Proceeding | key(proceeding,[N,office_id,HK,ballot-+sequence]) |
| Result | key(result,[N,office_id,HK,proceeding_id or main,candidate_source_id]) |
| Result source key | XML CandidateListId, printed list number stripped of a trailing dot, or exact presidential candidate label within the ballot |
| Source | latvia-- + key(url, exact retained source URL); source namespace L |
| Research date | date- + H([N,ownerType,ownerId,slot]); event/event_id/election, office/office_id/next, proceeding/proceeding_id/ballot |
| Evidence | ev- + H([record_key,[latvia,L,source_id],occurrenceIdentity,claim_kind]) |
| Unresolved token | unres- + H([record_key,occurrenceIdentity,original_token]) |

## Territorial identity boundary

The 2017 record IDs intentionally preserve the full pre-reform source snapshot separately. They are historical **identity records**, not 121 claims of legally abolished institutions. There may be legal continuity between a 2017 record and a later same-named office. No such equivalence is silently accepted. Current roster coverage is complete; cross-epoch deduplication remains LV-G01 and is mandatory before an unqualified unique-predecessor count or approved historical import. A reviewer can bind exact records later with primary legal/code evidence and preserve legacy aliases. Historical data must not be dropped as a shortcut.

The 2021 and 2025 exact municipal slugs share a documentary identity except the source-evidenced enlarged Madona. Both 2021 Madona and Varakļāni remain retained historical versions; no executable successor edge is emitted. Riga's 2020 extraordinary contest binds to the present Riga body, with an explicit identity review flag. No name comparison creates a merger edge. Names preserve Latvian diacritics; source slug is never reverse-translated to invent a name. Law annex territorial subdivisions do not become extra councils.

## Event and result binding

Normalize exactly one list vector per council/cycle.2017 XML DepartmentResults/DepartmentResultModel[Type=2]/CandidateListResults supplies authoritative list totals. Type0/1 aggregates and Type3 precincts are not extra offices. CandidateListsResults preference details remain retained raw. Current 2025 municipal page table1;2021/2020 per-council result tables; national/EP all-country list table only. Do not add district or polling-station vectors again. Three presidential support rows in 2023 have one first-round proceeding; the source's ballot-form 6 and protocol 8 are not round numbers.2015 fifth round keeps sequence 5 without manufacturing rounds1–4.2003 winner claim has unknown ballot sequence and no invented proceeding.

Lists and candidates are never additive within the same event here: local/Saeima/EP use lists, president uses parliamentary support claims. Support and opposition are not two separate electoral result rows; opposition is raw evidence. Missing seat cells stay NULL, unlike explicit 0. Seven 2022 conflicting percentages remain disputed with both official claims; future public use fails closed pending accepted resolution.

## Record keys and evidence

record_key=rec-+H(tuple): country=[country,latvia]; geography=[geography,latvia,G]; office=[office,N,O]; event=[event,N,O,HK]; proceeding=[proceeding,N,O,HK,P]; result_row=[result_row,N,O,HK,Rr]; source=[source,latvia,L,S]; input=[input,L,R,input_path]. Strings in these expressions are literal tokens.

Sparse result record_locator.proceeding_id isNULL even when result_row.proceeding_id is set; proceeding locators carry their own P. Every resolved FK includes its full namespace/office/event tuple. occurrenceIdentity is the full original source locator excluding source_id: path, SHA, XML XPath or HTML table/row/heading or PDF page/region. HTML/XML indexes are one-based; JSON pointers zero-based. Missing known source IDs are fatal; genuine unresolvable citation tokens attach to a real target in unresolved_evidence. No source row is fabricated from a token. Both competing 2022 sources are resolved FKs; unresolved is their adjudication, not source existence.

## Releases, corrections and publication

Documentary fingerprint `cb5cd35449a13d006e128b40b0e271b0d2312e2738d571377c84c26e86edda90`; candidate R=`country-package-latvia--sha256-cb5cd35449a13d006e128b40b0e271b0d2312e2738d571377c84c26e86edda90`. Hash exactly inventory.hash_inputs: sorted effective source/derived/tier descriptors, overrides=[], adapter/method/schema versions and unchanged DDL hashes. Exclude clock, attempt ID, report/ZIP bytes and unrelated lineages. All original source bytes are retained; unknown fields survive retained_input and raw_json. Approval changes draft tier bytes and therefore creates a new fingerprint; this draft R is never represented as published.

Unchanged re-import gives a new runtime attempt_id and the same R. Accepted correction gives new R, preserving unaffected office/HK/result keys. Incomplete refresh is not deletion: retain omitted prior identities/events/results and record omission diagnostics. An accepted override needs full target key, exact original guard, explicit decision/replacement, origin and competing claims; never auto-select alternate percentages.

Publication is a set of lineage/release pairs. Latvia updates only its member; citations resolve through each row's own L/R. Durable attempt ledger lives outside same-filesystem staging. Validate, checkpoint/close WAL, fsync and atomic rename only after all gates pass. Failure keeps the last good publication serving and logs failure durably. No repository or importer execution occurs here.
