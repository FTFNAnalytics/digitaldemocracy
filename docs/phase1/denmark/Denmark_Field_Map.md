# Denmark → Atlas full column map

Pinned main `e64afc324e34ae07f0760f49870ece64eb2ee645`. Justin accepted all 106 current + 240 historical draft offices on 2026-09-19. **223 columns across 20 data/audit tables**; unchanged schema_migration(version, applied_at) is migration-owned,2 additional columns, never research-loaded. No SQL/importer run. Table contracts below consume the complete pack arrays and preserve every original input. Named research gates stay open.

## Source notation and conversion rules

`O=data/research/denmark/office-register.json`, `G=geographies.json`, `E=events.json`, `R=results.json`, `Q=proceedings.json`, `S=sources.json`, `CW=identity-crosswalk.json`, `U=research-gaps.json` under that same root. `T=schemas/atlas/tiers/denmark.json`; Inventory and V are the named JSONs alongside this document. Every `/i` is a zero-based JSON array pointer, enumerated completely in V. Original evidence paths/hashes and JSONSTAT dimension tuples bind the final scalar to its source.

No absent field defaults to 0. Source `..`/null retains status and original claim. JSONSTAT index is the original flattened /dataset/value/i, decoded using ordered /dataset/dimension/id and category index maps. Both numeric 0 and null remain available. Raw/source tables are not discarded when a typed scalar is absent. Source HTML/PDF is retained inertly; no script execution. No importer may classify from a calendar string.

All typed rows own(L, Denmark release), never another lineage’s receipt. Complete deterministic tuple formulas are in [Identity Rules](Denmark_Identity_Rules.md); V enumerates every authored target. `raw_json` is the complete original authored row including evidence/conversions, not a narrowed selection. Fields with no schema column (totals, aliases, row_type, electoral mode, gaps) remain raw/retained.

## dataset_lineage

Source: **constants + Inventory**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| provenance_kind | country_package; newly sourced research, not an empty Europe extract. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| description | New Denmark research: 98 current municipal councils, regional transition, Folketinget/EP and historic councils; Realm systems remain separately gated. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |


## dataset_release

Source: **Inventory /hash_inputs and /verified_counts**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| fingerprint_sha 256 | H(Inventory /hash_inputs); SHA256 of compact recursively key-sorted UTF-8 JSON, not ZIP hash. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| hash_inputs_json | C(Inventory /hash_inputs), including source/derived/tier hashes and pinned schema versions; exclude outputs, attempts and timestamps. | Retain complete JSON; original bytes/hash recoverable. |
| adapter_version | atlas-denmark-full-register/1 documentary contract; no implementation. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| method_version | atlas-preserve-evidence/1. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| schema_version | atlas-master/1. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| research_snapshot_label | 2026-09-19 source capture; per-source updated fields retained in S /i/raw. Do not confuse capture with election date. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| upstream_release_id | NULL; no existing public Denmark package alias supplied. | Recompute exact deterministic tuple; fail on collision. |
| validated_counts_json | Inventory /verified_counts; count authored documents separately from actual future imported rows. | Retain complete JSON; original bytes/hash recoverable. |
| research_coverage_complete | 0: qualified historic totals and named gaps remain. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C({country_id: denmark, pinned_main_commit, source_inventory, coverage_complete: false}); retain original metadata, no invented release acceptance. | Retain complete JSON; original bytes/hash recoverable. |


## publication_release

Source: **future publication set**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |


## publication_receipt

Source: **future successful attempt receipt**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| singleton | 1 only in future successfully staged receipt. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| last_publish_attempt_id | Actual future durable attempt_id, not release identity. | Recompute exact deterministic tuple; fail on collision. |
| attempted_lineage_id | L. | Recompute exact deterministic tuple; fail on collision. |
| attempted_release_id | R; FK selected publication_release(L, R). | Recompute exact deterministic tuple; fail on collision. |


## retained_input

Source: **Inventory /hash_inputs/inputs**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| input_path | Inventory /hash_inputs/inputs/i/input_path exactly; one row for each source/derived/tier member; no self-referential output manifest input. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| input_kind | tier_classification for tier file; package for source/derived research; future accepted override only as override; diagnostic artifact as artifact. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| sha 256 | SHA256(original bytes) from inventory; reject mismatch. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| byte_count | Exact byte length from inventory; integer>=0. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| recovery_locator | ZIP member path plus hash; future durable artifact store must retrieve same bytes. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| payload_json | Exact JSON value if JSON; NULL for CSV/XLSX/HTML/ZIP. Retain binaries intact; never execute embedded code or formulas. | Retain complete JSON; original bytes/hash recoverable. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |


## country

Source: **report + U**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| country_code | DK. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| name | Danmark; language da. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| polity_kind | sovereign_country. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| region_id | europe; no exclusions inferred from the alert window. | Recompute exact deterministic tuple; fail on collision. |
| coverage_status | partial: general-purpose Denmark-proper councils are covered; Realm and named history/list gaps remain open. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| screening_as_of_label | 2026-09-19 research capture, not an election date. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| notes | C(research-gaps.json) and report; five operating regions plus one preparatory regional council in 2026. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| country_id | Constant denmark; FK country.country_id. | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C({country_id: denmark, name: Danmark, language: da, coverage_complete: false, scope_gates: U, pinned_main_commit}) | Retain complete JSON; original bytes/hash recoverable. |


## geography

Source: **G**. Identity/FK contract: FK(country, parent) nullable; no guessed successor edge.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| geography_id | G /i/geography_id exactly: DK; DK-K<code>; DK-KPRE2007-<code>; DK-R<code>; DK-AMT<code>. Prefix/vintage prevents code reuse collisions. | Recompute exact deterministic tuple; fail on collision. |
| name | G /i/name exactly, including æ/ø/å and archived spellings. No translation or silent normalization. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| parent_geography_id | G /i/parent_geography_id; current region hierarchy from retained DST table order; historical units parent DK, unknown successor links omitted. Østdanmark future parent projection is not applied early. | Recompute exact deterministic tuple; fail on collision. |
| effective_from_label | NULL baseline: first observed snapshot and record admission are not an evidenced geography start date. Preserve all labels in raw_json. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| effective_to_label | NULL baseline: absent from current snapshot is not an exact abolition date. Historic observations remain raw. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| country_id | Constant denmark; FK country.country_id. | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire G /i); keep geography_type, language, vintage and evidence here, not invented DDL columns. | Retain complete JSON; original bytes/hash recoverable. |


## research_date

Source: **E and O.next_election**. Identity/FK contract: Owner ID deterministic; real calendar validation; precision/certainty separately checked.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| date_id | Vector or Identity Rules owner-based date key. | Recompute exact deterministic tuple; fail on collision. |
| label | E /i/date when non-null, otherwise string(E /i/year); O /i/next_election/label for next metadata. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| precision | E /i/precision: day for ministry-bound local/FT dates, year for EP; O next precision day. No invented month/day. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| certainty | E /i/certainty called for observed historical dates; O next statutory, not called. Source certainty retained distinctly from day precision. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| year | E /i/year or O next/year; integer, never generated from capture date. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| month | Parse exact ISO source date when day precision; O next/month; NULL for year-only events. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| day | Parse exact ISO source date when day precision; O next/day; NULL for year-only events. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| range_start_id | NULL baseline; no range claims authored. | Recompute exact deterministic tuple; fail on collision. |
| range_end_id | NULL baseline; no range claims authored. | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C({owner_type, owner_id, slot, source_date_object, evidence}); do not reinterpret withheld dates. | Retain complete JSON; original bytes/hash recoverable. |


## office

Source: **O**. Identity/FK contract: FK(country, gid), mutual tier FK(N, oid); exact 346 IDs; no mayor rows.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| geography_id | O /i/geography_id; required FK. | Recompute exact deterministic tuple; fail on collision. |
| name | O /i/name; statutory source body wording or explicitly documentary body-category label plus original place name. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_type | O /i/office_type: municipal_council, regional_council, county_council, national_parliament or european_parliament_delegation. No popular borgmester or chair row. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_status | O /i/office_status exactly. Both retiring 084/085 councils and preparatory 086 council current at 2026-09-19. Historical source councils remain active records. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| record_state | active including historical offices; no implicit withdrawal. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| state_note | C({review_notes: O /i/review_notes, raw: O /i/raw}); electoral_mode remains visible. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| registry_qualified | NULL: source roster does not establish future candidacy or legal ballot eligibility. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| next_date_id | Vector next_date_id only where O /i/next_election non-null; otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| next_date_resolution | resolved where O next_election exists, otherwise unknown. Statutory 2029-11-20 outside alert window does not remove office. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| next_history_key | NULL: next-date metadata is not a prospective event. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| id_namespace | Constant N=cdd-observatory-v 1; part of office/event/result identities. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | O/E/R /i/office_id exactly; FK (N, office_id). | Recompute exact deterministic tuple; fail on collision. |
| country_id | Constant denmark; FK country.country_id. | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire O /i); electoral_mode, source code/vintage, coverage_complete, next metadata and review notes survive losslessly. | Retain complete JSON; original bytes/hash recoverable. |


## office_tier_classification

Source: **T**. Identity/FK contract: Mutual office FK; exact retained tier path/kind/hash; drafts block publication.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| tier | T /classifications/i/tier: national→national_context; regional/municipal/other unchanged; unknown→NULL. Never calendar strings. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| review_status | needs_review for all known draft tiers; no approved status inferred from unflagged row. NULL tier would require unknown. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| rationale | T /classifications/i/rationale exact; review categories/evidence retained raw. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| classification_path | schemas/atlas/tiers/denmark.json. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| classification_kind | tier_classification. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| classification_sha 256 | Inventory /tier_sha 256; FK to exact retained_input(L, R, path, kind, hash). | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| id_namespace | Constant N=cdd-observatory-v 1; part of office/event/result identities. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | O/E/R /i/office_id exactly; FK (N, office_id). | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C({origin, source_row, qualifiers, evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Retain complete JSON; original bytes/hash recoverable. |


## election_event

Source: **E**. Identity/FK contract: PK(N, oid, HK), unique(N, event_id), required date FK; same event for each result representation.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| event_id | E /i/event_id = K(event,[denmark, N, HK]); exact vector. | Recompute exact deterministic tuple; fail on collision. |
| date_id | V /events/i/date_id; create one owner-based date row from E /i/date or year. | Recompute exact deterministic tuple; fail on collision. |
| date_resolution | resolved for all current authored events, including year-only EP; absence of day is not unknown year. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| event_kind | E /i/event_kind ordinary in documentary data; source-qualified election series, not replacement proceedings. Future special/repeat claims require evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| selected_history_role | E /i/selected_history_role selected; all supplied historic anchors retained, not just last three. Dates-only FT events remain result-incomplete. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| electoral_system | NULL baseline; source description retained raw, no inferred seat-allocation formula. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| comparability | NULL; no merger-adjusted historical comparability asserted. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| ballot_basis | valid_votes for source election ballot/party totals; candidate personal marks are a separate non-additive row representation retained in result raw. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| share_unit | percent_0_100 including absent shares. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| legal_outcome | unknown throughout authored event rows; source provenance is not independent certification. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| record_state | active; retained partial history is not deleted. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| state_note | C(E /i/raw); keep statistical table vintage, 2005 successor-election qualification and Denmark-proper national scope. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| id_namespace | Constant N=cdd-observatory-v 1; part of office/event/result identities. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | O/E/R /i/office_id exactly; FK (N, office_id). | Recompute exact deterministic tuple; fail on collision. |
| history_key | E/R /i/history_key exactly; FK (N, office_id, HK). | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire E /i), including valid_votes, total_ballots, electorate and total_claims. DDL has no dedicated totals columns; no invented columns or duplicated metric tables. | Retain complete JSON; original bytes/hash recoverable. |


## proceeding

Source: **Q=[]**. Identity/FK contract: Exactly 0; no election-proceeding inference from table presence.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| id_namespace | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| history_key | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| proceeding_id | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| kind | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| sequence_no | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| supersedes_id | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| legal_outcome | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| release_id | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | No rows: proceedings.json = []; aggregate election returns do not supply round/recount/certification proceedings. Future rows require positive source evidence and full namespaced event FK. | Retain complete JSON; original bytes/hash recoverable. |


## source

Source: **S**. Identity/FK contract: PK(country, L, sid); retained hash and exact query evidence.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| source_id | S /i/source_id = denmark-- + K(source,[exact URL, exact request JSON or null]); API table/query is part of identity, not URL alone. | Recompute exact deterministic tuple; fail on collision. |
| publisher | S /i/publisher actual official host, not invented person. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| title | S /i/input_path filename as deterministic artifact title; upstream titles remain in retained bytes. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| url | S /i/url; retained POST request in raw_json is required to recover DST table/dimensions. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| checked_as_of_label | S /i/retrieved_at exactly = 2026-09-19; per-source updated retained raw. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| evidence_grade | NULL; official origin does not automatically certify a research derivative. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| file_sha 256 | S /i/sha 256 exact retrieved bytes. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| locator | S /i/input_path; original member/sheet/XPath in evidence_link. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| data_rights | Literal unknown unless a source-specific licence is accepted; no universal licence inferred from official host. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| country_id | Constant denmark; FK country.country_id. | Recompute exact deterministic tuple; fail on collision. |
| source_namespace | Constant L; never latest global release alias. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire S /i); query, source update metadata, exact bytes and provenance retained. | Retain complete JSON; original bytes/hash recoverable. |


## party_mapping

Source: **no mappings supplied**. Identity/FK contract: Exactly 0; preserve original labels, never fabricated FK.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| country_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Recompute exact deterministic tuple; fail on collision. |
| party_namespace | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| mapping_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Recompute exact deterministic tuple; fail on collision. |
| source_context | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| election_context | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| original_label | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| original_code | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| mapped_group | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| uncertainty | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Retain complete JSON; original bytes/hash recoverable. |


## result_row

Source: **R**. Identity/FK contract: PK(N, oid, HK, rid); full event FK; optional party/proceeding FKs NULL.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| result_row_id | R /i/result_row_id; exact scoped result token/vector. | Recompute exact deterministic tuple; fail on collision. |
| proceeding_id | NULL for every R /i; no invented round. | Recompute exact deterministic tuple; fail on collision. |
| candidate_or_list_label | R /i/candidate_or_list_label exact DST label. Candidate labels retain municipality and party parentheticals. EJR/independent aggregate labels are groups, not invented parties. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| original_party_label | R /i/original_party_label, nullable for candidate strings not parsed into an invented party entity. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| original_party_code | R /i/original_party_code exact source code or candidate parenthetical; nullable for aggregate groups. Scope by source table and event, never globally merge a reused letter. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| party_namespace | NULL baseline. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| party_mapping_id | NULL baseline. | Recompute exact deterministic tuple; fail on collision. |
| votes | R /i/votes: source scalar for council-party/candidate rows; national/EP documented sum of all 99 disjoint DST reporting areas only when every cell known. Derived sum is not called certified total. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| votes_status | R /i/votes_status: positive recorded, explicit 0 zero, absent/withheldunknown. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| share | R /i/share: only explicit FVPANDEL/EVPANDEL percent or candidate PERSS (all valid votes). PERSP is party-denominator raw only. No derived vote-share replacement. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| share_status | R /i/share_status, same missing/zero rule. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| share_unit | percent_0_100. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| seats | R /i/seats: exact disjoint elected-men + elected-women source counts, both required. NULL for candidate/EP rows without seat observation; no fabricated single seat from candidate label. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| seats_status | R /i/seats_status, same missing/zero rule. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| elected_flag | R /i/elected_flag true→1 for tables explicitly titled elected candidates; NULL for party/statistical groups. Not a mayoral result. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| is_substitute | NULL; no substitute appointment projection. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| evidence_status | recorded in this derivative; unresolved whole-event conflicts require disputed/withhold policy, not arbitrary correction. Aggregate-audit currently has no municipal vote mismatches. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| id_namespace | Constant N=cdd-observatory-v 1; part of office/event/result identities. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | O/E/R /i/office_id exactly; FK (N, office_id). | Recompute exact deterministic tuple; fail on collision. |
| history_key | E/R /i/history_key exactly; FK (N, office_id, HK). | Recompute exact deterministic tuple; fail on collision. |
| country_id | Constant denmark; FK country.country_id. | Recompute exact deterministic tuple; fail on collision. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire R /i); row_type, source_measures, source status markers, identity_token, all claims and conversions remain. Party totals, statistical groups and elected candidate personal votes are NOT additive. | Retain complete JSON; original bytes/hash recoverable. |


## record_locator

Source: **O/G/E/R/S and retained input targets**. Identity/FK contract: Sparse-target CHECK; fill only columns for target entity kind, never copy office geography into locator.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| record_key | rec-+H([entity_kind,... PKcomponents]); exact Identity Rules tuples. | Recompute exact deterministic tuple; fail on collision. |
| entity_kind | country/geography/office/event/proceeding/result_row/source/input per real target. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| country_id | denmark for typed targets except input; input target NULL. | Recompute exact deterministic tuple; fail on collision. |
| geography_id | Actual gid only for geography target; all other kinds NULL (including office). | Recompute exact deterministic tuple; fail on collision. |
| id_namespace | N only for office/event/result_row; otherwise NULL. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| office_id | oid only for office/event/result_row; otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| history_key | HK only for event/result_row; otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| proceeding_id | NULL baseline (no proceeding targets); remain NULL for result_row targets under sparse-target DDL CHECK. | Recompute exact deterministic tuple; fail on collision. |
| result_row_id | rid only for result_row; otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| party_namespace | NULL baseline. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| party_mapping_id | NULL baseline. | Recompute exact deterministic tuple; fail on collision. |
| source_namespace | L only for source target; otherwise NULL. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| source_id | sid only for source target; otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| input_path | Retained path only for input target; otherwise NULL. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| source_row_locator | C({derived_path, derived_pointer, source_evidence}); exact JSONSTAT /dataset/value/index plus dimension tuple; HTML section or PDF page/question. Never invent a PDF JSON pointer. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |


## evidence_link

Source: **entity evidence[] and raw source claims**. Identity/FK contract: Real locator/source/date FKs; broken resolved reference fails closed.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| evidence_id | ev-+H([record_key,[denmark, L, source_id],[input_path, json_pointer_or_locator], claim_kind]); exact identity tuple. | Recompute exact deterministic tuple; fail on collision. |
| record_key | FK to real target locator; no orphan invented target. | Recompute exact deterministic tuple; fail on collision. |
| source_country_id | denmark. | Recompute exact deterministic tuple; fail on collision. |
| source_id | Lookup S by evidence input_path; resolved source must exist. Missing known source→fatal. | Recompute exact deterministic tuple; fail on collision. |
| source_locator | C(full evidence object): original path/hash plus json_pointer or locator, with dimensions. Match S by input_path and verify hash. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| claim_kind | register_identity, historical_binding, election_date, source_scalar, disjoint_sum, institutional_mode, next_date or research_gap. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| date_claim_id | Actual research_date FK for date claim, otherwise NULL. | Recompute exact deterministic tuple; fail on collision. |
| claim_json | C({original_claims, conversion, scope}); raw cells stay available even when scalar NULL. No invented certification. | Retain complete JSON; original bytes/hash recoverable. |
| source_namespace | Constant L; never latest global release alias. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |


## unresolved_evidence

Source: **U + retained unresolved candidate inventory**. Identity/FK contract: Real country locator; unresolved token is not a source FK.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| unresolved_id | unres-+H([record_key,[source_locator], original_token]); exact Identity Rules tuple. | Recompute exact deterministic tuple; fail on collision. |
| record_key | Country record key rec(country,[denmark]) for U /i named gates; unresolved-candidate-bindings stay retained until office binding accepted, with optional country-level gap token. | Recompute exact deterministic tuple; fail on collision. |
| original_token | U /i/original_token; explicitly authored research-gap token, never a fabricated upstream catalogue ID. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| source_locator | C({input_path: data/research/denmark/research-gaps.json, json_pointer:/i}); exact source evidence lives in U /i/evidence. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| reason | U /i/reason; missing sources/bindings do not prove no office or zero votes. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C({origin, source_row, qualifiers, evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Retain complete JSON; original bytes/hash recoverable. |


## identity_crosswalk

Source: **CW**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| entity_kind | office for supplied CW entries; other entity crosswalks from complete vector source tuples when implemented. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| upstream_namespace | CW /i/upstream_namespace exactly for old municipal code; DST/<table>/<entity-type> for further original source tuples. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| upstream_id | CW /i/upstream_id; source area code scoped to old table; candidate codes always scoped by table/year, never person identities globally. | Recompute exact deterministic tuple; fail on collision. |
| record_key | rec(office,[N, CW /i/target_office_id]); referenced office must exist. No guessed successor target. | Recompute exact deterministic tuple; fail on collision. |
| reason | CW /i/reason; old 707 Grenaa ≠ current 707 Norddjurs; old 849 Aabybro ≠ current 849 Jammerbugt. Same-code/name continuity keeps vintage qualification. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |
| release_id | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Recompute exact deterministic tuple; fail on collision. |
| raw_json | C(entire CW /i); source/current labels and evidence retained; no invented legal merger mapping. | Retain complete JSON; original bytes/hash recoverable. |


## ingest_attempt

Source: **future durable ledger only**. Identity/FK contract: Use exact Identity Rules tuple; lineage/release points to own selected publication member. Future operational rows are not research claims.

| Destination column | Source locator → conversion / NULL policy | Validation assertion |
| --- | --- | --- |
| attempt_id | Future fresh attempt-UUID each run; no attempt created here. | Recompute exact deterministic tuple; fail on collision. |
| operator | Actual future initiator, not invented Justin acceptance. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| script_version | Actual future importer version; not implemented here. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| started_at | Actual future UTC ledger start, durable before staging. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| finished_at | NULL until completion, then actual UTC. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| status | Future started/succeeded/failed per ledger; no succeeded row authored here. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| input_inventory_json | C(actual effective inventory and provenance at future attempt). | Retain complete JSON; original bytes/hash recoverable. |
| successful_release_id | R only on reconciled successful publication; NULL on failure. | Recompute exact deterministic tuple; fail on collision. |
| publication_set_json | NULL while started or failed; on success full lineage/release array, preserving unrelated members. | Retain complete JSON; original bytes/hash recoverable. |
| row_counts_json | Actual measured execution counts; no documentary count represented as executed. | Retain complete JSON; original bytes/hash recoverable. |
| error_text | Nonempty actual failure message on failed; NULL for started/succeeded. Do not fabricate. | Enforce enum/value/precision and NULL policy exactly; do not synthesize missing evidence. |
| lineage_id | Constant L; ownership FK to selected Denmark publication member. | Recompute exact deterministic tuple; fail on collision. |


## Publication and retained representations

The source cubes are losslessly retained, including structural zeros, population metadata, candidate rows not yet bound, non-reserved-letter groups, all unknown fields and mixed reporting components. Current/historical office qualification does not establish result completeness. No aggregation across candidate/party representations, regional totals in municipal tables, or national/component vectors. Greenland/Faroe systems remain a named gate and do not acquire dummy offices. See acceptance examples for exact row shapes and the CI checklist for future fail-closed gates.
