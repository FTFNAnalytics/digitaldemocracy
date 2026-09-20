# Denmark identities

Accepted 2026-09-19 against review pack main `e64afc324e34ae07f0760f49870ece64eb2ee645`. Namespace `N=cdd-observatory-v1`; country `denmark`; lineage `L=country-package-denmark`. These are documentary Atlas identifiers minted from source-evidenced institutions, **not claims that DST publishes office IDs**. Justin accepted all 346 draft offices; Greenland/Faroe Realm gates, 2007/earlier merger successor bindings, KMD/DST detail holes, 98 unresolved candidate bindings, and EP detail gaps stay open. Existing country IDs and unrelated lineages are untouched.

## Canonical encoding and keys

`C(x)` is compact UTF-8 JSON, object keys recursively sorted lexicographically, array order retained, Unicode characters unescaped, no NaN/Infinity. This matches pinned `scripts/import/normalize.ts` stable/digest/key for the input domain used here. `H(x)=SHA256(C(x))` lowercase hex; `K(prefix,x)=prefix + '-' + H(x)[0:24]`. Integers remain integers. Do not reorder a source query array or normalize labels/URLs silently.

| Entity | Exact deterministic rule |
| --- | --- |
| Current municipal office | `DK-K<DST three-digit code>-C` |
| Historical different-code/name municipality | `DK-KPRE2007-<archived DST code>-C` |
| Regional office | `DK-R<DST three-digit region code>-C` (081–086) |
| Former county office | `DK-AMT<DST archived county code>-C` |
| National parliament | DK-FT |
| European Parliament delegation | DK-EP; other tier draft |
| Geography | Same sourced code/vintage prefix without final -C; national DK |
| History key | `office_id::source_year::ISO_date_or_literal_year::body`; literal year used for year-precision EP |
| Event | K(event,[denmark, N, history_key]) |
| Result | K(result,[N, office_id, history_key, null, raw.identity_token]) |
| Source | denmark-- + K(source,[exact_url, request_json_or_null]); POST query identity is mandatory |
| Date | date- + H([N, owner_type, owner_id, slot]); owner_type office/event, slot next/ballot |
| Record locator | rec- + H([entity_kind,... PK components]); tuples below |
| Evidence | ev- + H([record_key,[denmark, L, source_id],[input_path, json_pointer_or_locator], claim_kind]) |
| Unresolved | unres- + H([record_key,[source_locator], original_token]) |


Record tuples: country `[denmark]`; geography `[denmark,gid]`; office `[N,oid]`; event `[N,oid,HK]`; result_row `[N,oid,HK,rid]`; source `[denmark,L,sid]`; input `[L,input_path]`. No proceeding/party-mapping vectors are authored. Every result/event FK carries N, office_id, HK. In source evidence occurrence identity, use JSON pointer when non-null; otherwise the exact locator string. Different source versions update claims without using retrieval times as source IDs.

Result identity tokens: council party/group `['DST',table,'PARTI',code]`; FT `['DST','FT',partycode]`; EP `['DST','EP',partycode]`; elected candidate `['DST',KVyyPERS,'KANDIDAT',candidatecode]`. A source candidate code is table/year-scoped, not a cross-election person ID. Vote/seat/share value is never part of ID.

## Municipal reform and regional transition

Archived VALGK3X contains **275 positively evidenced councils**, excluding national/county geographic totals, Bornholm's pre-merger aggregate 400, Christiansø 411 and structurally empty future Ærø 492. **49** source code/name continuations attach older contests to current council identities, with boundary reviews still open. The explicit same-code spelling aliases are 169 Høje Taastrup/Høje-Taastrup and 751 Århus/Aarhus; original labels remain in evidence. **226** other old municipal identities remain separate. This is a documentary continuation policy, not a legal assertion of unchanged territory.

Never merge old 707 Grenaa with new 707 Norddjurs, or old 849 Aabybro with new 849 Jammerbugt. `identity-crosswalk.json` enumerates all 275 old bindings. The 14 historical amtsråd are independent regional-tier offices, not a second municipal layer. Do not infer a one-to-one county successor.

In 2026, five operating region councils coexist with the elected preparatory Østdanmark council. 084/085 have 2021 elections and extended service through 31 Dec 2026; no 2025 election is invented for either. 086 has one 2025 event, preparatory in 2026 and operating from 1 Jan 2027. No second office for its changed functional phase. Keep future successor metadata separate from an event.

## History/result binding and missing values

VALGK3/VALGK3X and AKVA3/AKVA3X provide source-coded office-party-year rows. Only positive-evidence area-years create contests; structural all-zero area grids do not. Current municipal totals from KVRES attach to the same event and must reconcile. Party categories with all-zero votes/seats remain in retained cubes rather than implying a candidacy. Positive votes with zero seats retain actual zero.

Two disjoint elected-sex counts produce a documented seat sum only if both are known. Candidate personal-vote tables reuse the council event; they cover **elected candidates only**, not a full candidate slate, and are not additive to party rows. PERSS uses all valid votes; PERSP uses the party denominator and stays raw. 98 unresolved older name bindings remain retained, with exact original candidate IDs; do not coerce a match.

FVKOM/EVKOM1 are municipal reporting **components of national/EP elections**, not municipal-council contests. Summing all 99 disjoint reporting areas (98 municipalities plus Christiansø) is an explicitly labelled derivation, only if every required cell exists. FVKAND elected-men+women gives Denmark-proper seats, not all 179 Realm seats. EJR and independent aggregates are statistical groups, not new parties. No party-family mappings, fabricated certified totals, normalized shares or margins.

National date anchors from 1849 onward remain even without typed results; 1848 constituent-assembly row is retained source only, not assigned to Folketinget. European Parliament events retain source-year precision; no guessed polling day. Ministry 20 Nov 2029 is statutory next metadata only, not a prospective event and not an eligibility filter.

## Releases, overrides and publication

Candidate fingerprint `02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737`; candidate release `country-package-denmark--sha256-02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737`. `Denmark_Input_Inventory.json /hash_inputs` is the exact preimage: sorted source/research/tier input descriptors, empty overrides, adapter/method/schema versions, and pinned migration hashes. Reports, vectors, ZIP, SHA256SUMS, attempt ID, execution time and other lineages are excluded. Source bytes and query definitions are retained; no circular hash inputs.

An unchanged re-import creates a new durable attempt but the same release_id. Changed research, accepted tier bytes or an accepted Denmark override changes fingerprint/release. This draft does **not** authorize import. Future override contract `atlas-override/1` requires expected-original guards, full namespaced target key, source claims, review provenance and explicit acceptance. No production override exists in this pack.

Incomplete refresh ≠ deletion: keep omitted prior offices/events/results and their evidence dependencies in the effective input set. Withdraw only via explicit evidenced accepted change; retain historical identity/citation. Preserve all unrelated publication members and row-owned lineage release citations. Durable attempt ledger precedes same-FS staging, transaction validation, WAL checkpoint, fsync and atomic rename; failure leaves last good publication serving. No execution performed here.

- [ ] Justin accepts Denmark identities and source-vintage continuation policy.
- [ ] Justin accepts draft tiers separately.
