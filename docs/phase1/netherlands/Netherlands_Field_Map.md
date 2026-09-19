# Netherlands → Atlas full field map

Draft against main `b293da99b97a8ae008d87ee2e57210cde0678004`. **223 columns across 20 destination tables**, plus migration-owned schema_migration(version,description), which this package does not write. No application/importer code, DDL change or SQLite execution.

## Source notation

D=`data/research/netherlands/`; O=office-register.json, G=geography.json, E=events.json, R=results.json, S=source-catalogue.json, U=unresolved-bindings.json; T=`schemas/atlas/tiers/netherlands.json`. `/i/field` is zero-based RFC 6901. N=`cdd-observatory-v1`, L=`country-package-netherlands`, RLS=inventory candidate release (R in identity prose, distinct from results file R). Original sources and ZIP members are immutable retained_input; unknown fields go to raw_json, no invented extension columns. source-catalogue plus evidence[] resolves original bytes/rows. HTML and workbook formulas are inert evidence.

## Source-specific projection and overlap

| Input | Projection | Mandatory qualification / exclusion |
|---|---|---|
| CBS 2026 XLSX Gemeenten_alfabetisch rows 2–343 |342 current municipality councils,12 province identities, explicit province parents | Codes padded to fixed width; populations absent/not invented; observation is not boundary-effective date. |
| Raadzetels_GR2026.csv | office raw current council capacity | Capacity is not party seats, votes or election. |
| GR 2026 long CSV | select G-prefixed municipality levels, list metrics | Exclude national/province rollups; keep candidate preferences raw;340 retrieved current council vectors; Hilversum/Wijdemeren merger watch separately retained. |
| GR 2022 archive Telling_* EML 510 |333 events with explicit ElectionDate and list-level TotalVotes/Selection/AffiliationIdentifier | **Pre-publication**; every projected result preliminary. Candidate selections not list rows. Resultaat 520 and definitions retained, not duplicate events; README corrections not silently applied. |
| GR 2014/2018 station CSV | grouped by source municipality code and exact party label | Sum each supplied station row once; retain component row indices. Research subtotal, not independently certified municipality total; do not calculate missing shares. |
| PS 2023 municipality CSV |12 province events; source GM→CBSprovince join | Join contemporaneous CBS 2023 GM→PV table (all 342 codes/provinces verified equal to 2026 roster); aggregate municipality totals once; station file raw-only. No extra municipality offices generated for province results. |
| AB 2023 waterboard municipality CSV |21 waterboard offices/events, list votes | Domain token scopes group; station file raw-only. Functional boundaries overlap provinces; reserved seats not voter returns. |
| TK 2023/2025,EK 2023,EP 2024 long CSV | only country RegioCode=L 528 aggregate | No addition of province/constituency/municipality/candidate duplicates. If seat row number absent, join exact label only where one numbered list matches in same region. Senate **unweighted** list votes project; weighted metrics retained raw. |
| TK 2021 municipality CSV | one chamber event with explicit reported-subtotal list vectors | National/overseas certification reconciliation remains open; no inferred share or seat. |
| ER/KC 2023 long CSV |3 island councils +4 electoral colleges | Same geography can have different bodies. Separate Caribbean/nonresident scope; no fake European municipality or province. |
| Rotterdam 39 official result pages |39 wijkraad events, candidate votes/published percentages | Candidate numbering scoped to body/event; seat icon gives elected=true; absence not fabricated zero. |
| Amsterdam 2026 party sheet |8 committee events and published list votes/percentages | Body names forward-filled only within sheet; exact row evidence. OSV municipal original/aanpassingen retained raw, not duplicate council history or silently preferred correction. |
| Institutional pages | office next-date metadata, institutional rules |2030 month/2030 day expected; no prospective events inferred. Sourced 2027 dates can populate office next-date calendar after approval. |

Historical year-only date labels remain partial; calendar dates cannot retrofit exact historic dates. Raw candidate, total, blank/invalid, turnout, elected-preference and weighted fields stay retained rather than squeezed into invented scalar columns. No margin/tightness/control/party-family metric is computed. No proceedings or party mappings authored. Every office is independent of alert-window membership.

## Full destination column map

Each table’s rule applies to every row below. Conversion includes source locator/null policy; Identity Rules and complete vectors define exact keys. Missing is SQL NULL, not stringNULL or numeric 0.

## dataset_lineage

PK L; no unrelated lineage replacement.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK L; no unrelated lineage replacement. |
| `provenance_kind` | country_package; newly sourced research, not an empty Europe extract. | PK L; no unrelated lineage replacement. |
| `description` | Netherlands body-level current register and qualified historic returns; coverage partial. | PK L; no unrelated lineage replacement. |

## dataset_release

PK(L,R); immutable fingerprint, draft candidate cannot publish.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `fingerprint_sha256` | H(Inventory /hash_inputs),64 lowercasehex. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `hash_inputs_json` | C(Inventory /hash_inputs); exact effective inputs and accepted versions, no self-hash. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `adapter_version` | atlas-netherlands-full-register/1; documentary contract, not implemented. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `method_version` | atlas-preserve-evidence/1. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `schema_version` | atlas-master/1. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `research_snapshot_label` | 2026-09-19 capture; source roster as_of 2026-01-01 and older results retain own dates. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `upstream_release_id` | NULL; no existing public Netherlands package alias supplied. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `validated_counts_json` | Inventory /verified_counts; count authored documents separately from actual future imported rows. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `research_coverage_complete` | 0: qualified historic totals and named gaps remain. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(L,R); immutable fingerprint, draft candidate cannot publish. |

## publication_release

One selected release per lineage; full publication set coexists.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | One selected release per lineage; full publication set coexists. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | One selected release per lineage; full publication set coexists. |

## publication_receipt

Singleton operational receipt, not citation identity.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `singleton` | 1 only in future successfully staged receipt. | Singleton operational receipt, not citation identity. |
| `last_publish_attempt_id` | Actual future durable attempt_id, not release identity. | Singleton operational receipt, not citation identity. |
| `attempted_lineage_id` | L. | Singleton operational receipt, not citation identity. |
| `attempted_release_id` | R; FK selected publication_release(L,R). | Singleton operational receipt, not citation identity. |

## retained_input

PK(L,R,path); every hash resolves to exact original bytes.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(L,R,path); every hash resolves to exact original bytes. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(L,R,path); every hash resolves to exact original bytes. |
| `input_path` | Each Inventory /hash_inputs/effective_inputs/i/path; exact relative path, part of PK. | PK(L,R,path); every hash resolves to exact original bytes. |
| `input_kind` | tier_classification for tier file; package for source/derived research; future accepted override only as override; diagnostic artifact as artifact. | PK(L,R,path); every hash resolves to exact original bytes. |
| `sha256` | SHA 256(original bytes) from inventory; reject mismatch. | PK(L,R,path); every hash resolves to exact original bytes. |
| `byte_count` | Exact byte length from inventory; integer>=0. | PK(L,R,path); every hash resolves to exact original bytes. |
| `recovery_locator` | ZIP member path plus hash; future durable artifact store must retrieve same bytes. | PK(L,R,path); every hash resolves to exact original bytes. |
| `payload_json` | Exact JSON value if JSON; NULL for CSV/XLSX/HTML/ZIP. Retain binaries intact; never execute embedded code or formulas. | PK(L,R,path); every hash resolves to exact original bytes. |

## country

PK netherlands; coverage partial, not screened_out.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `country_id` | Constant netherlands; FK country.country_id. | PK netherlands; coverage partial, not screened_out. |
| `country_code` | NL. | PK netherlands; coverage partial, not screened_out. |
| `name` | Netherlands. | PK netherlands; coverage partial, not screened_out. |
| `polity_kind` | sovereign_country; Caribbean public bodies remain under netherlands, no separate invented country. | PK netherlands; coverage partial, not screened_out. |
| `region_id` | europe; geographic Caribbean scope stays in raw and must filter calendar eligibility separately. | PK netherlands; coverage partial, not screened_out. |
| `coverage_status` | partial; no full historical coverage claim. | PK netherlands; coverage partial, not screened_out. |
| `screening_as_of_label` | 2026-09-19 research capture, not an election date. | PK netherlands; coverage partial, not screened_out. |
| `notes` | Report named gaps; appointed-office distinction; body-level granularity; alert window never excludes offices. | PK netherlands; coverage partial, not screened_out. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK netherlands; coverage partial, not screened_out. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK netherlands; coverage partial, not screened_out. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK netherlands; coverage partial, not screened_out. |

## geography

PK(country,gid); parents exist/acyclic; no invented boundary dates.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `country_id` | Constant netherlands; FK country.country_id. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `geography_id` | G /i/geography_id exactly from vectors; scoped national/CBS/body tokens. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `name` | G /i/name; preserve accents/source tokens. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `parent_geography_id` | G /i/parent_geography_id if present, otherwise NULL. CBS province and sourced municipality parents resolve in same country; waterboard/nonresident parents NULL. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `effective_from_label` | NULL: observation/year is not a verified boundary effective date. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `effective_to_label` | NULL: absent current code does not prove a specific abolition day. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(country,gid); parents exist/acyclic; no invented boundary dates. |

## research_date

Valid components and precision; no fabricated days or guaranteed certainty.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `date_id` | Vector or Identity Rules owner-based date key. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `label` | E /i/date or O /i/next_election/label exactly. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `precision` | E /i/precision or next metadata precision: day/year, or month for2030-03. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `certainty` | Historical supplied dates called; upcoming metadata expected. Neither means legal certification. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `year` | Parse known first 4 digits only; unknown→NULL. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `month` | Day/month labels only; year-only→NULL. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `day` | Day label only; month/year→NULL, never pad 01. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `range_start_id` | NULL baseline; no range claims authored. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `range_end_id` | NULL baseline; no range claims authored. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Valid components and precision; no fabricated days or guaranteed certainty. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Valid components and precision; no fabricated days or guaranteed certainty. |

## office

PK(N,oid); required geography and one tier row;501 exact IDs.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `id_namespace` | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `office_id` | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `country_id` | Constant netherlands; FK country.country_id. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `geography_id` | O /i/geography_id; required FK. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `name` | O /i/name; sourced jurisdiction plus documented body type. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `office_type` | O /i/office_type; council, senate, waterboard, college and committee kept distinct. No invented mayor rows. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `office_status` | O /i/current true→current, false→historical; all 501 identities retained. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `record_state` | active including historical offices; no implicit withdrawal. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `state_note` | O /i/raw historic/scope notes; NULL only if none. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `registry_qualified` | NULL; roster presence does not prove future ballot eligibility. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `next_date_id` | Owner-based vector for O /i/next_election when present, else NULL. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `next_date_resolution` | resolved for explicit next metadata, unknown if absent; expected certainty still retained. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `next_history_key` | NULL: next-date metadata is not a prospective event. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid); required geography and one tier row;501 exact IDs. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(N,oid); required geography and one tier row;501 exact IDs. |

## office_tier_classification

Mutual deferred FK; exact office-set equality, draft approval gate.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `id_namespace` | Constant N=cdd-observatory-v1; part of office/event/result identities. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `office_id` | O/E/R /i/office_id exactly; FK (N,office_id). | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `tier` | T /classifications/i/tier: national→national_context; regional/municipal/other unchanged; unknown→NULL. Never calendar strings. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `review_status` | needs_review for all known draft tiers; no approved status inferred from unflagged row. NULL tier would require unknown. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `rationale` | T /classifications/i/rationale exact; review categories/evidence retained raw. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `classification_path` | schemas/atlas/tiers/netherlands.json. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `classification_kind` | tier_classification. | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `classification_sha256` | Inventory /tier_sha 256; FK to exact retained_input(L,R,path,kind,hash). | Mutual deferred FK; exact office-set equality, draft approval gate. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Mutual deferred FK; exact office-set equality, draft approval gate. |

## election_event

PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `id_namespace` | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `office_id` | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `history_key` | E/R /i/history_key exactly; FK (N,office_id,HK). | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `event_id` | E /i/event_id; K(event,[netherlands,N,HK]); preserve on refined date via crosswalk. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `date_id` | Vector date_id for event owner; conflict later requires NULL resolved pointer with separate claims. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `date_resolution` | E /i/date_resolution=resolved for sourced label, including year precision. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `event_kind` | E /i/event_kind: indirect for Senate, ordinary otherwise. Historical is not schema event_kind. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `selected_history_role` | E /i/selected_history_role=selected except Leeuwarderadeel 2014 other/disputed; selection does not certify returns. Future disputes retain other/none as justified. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `electoral_system` | NULL baseline; source description retained raw, no inferred seat-allocation formula. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `comparability` | NULL; no merger-adjusted historical comparability asserted. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `ballot_basis` | E /i/ballot_basis list_votes or candidate_marks (Rotterdam); Senate votes are unweighted selector ballots. Weighted tallies separate raw. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `share_unit` | percent_0_100 including absent shares. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `legal_outcome` | E /i/legal_outcome: preliminary for 2022 EML, disputed for Leeuwarderadeel 2014, unknown otherwise unless independently established. No certified claim. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `record_state` | active; retained partial history is not deleted. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `state_note` | E /i/raw qualifiers, provisional/readme/aggregation scope; not just cycle label. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(N,oid,HK); unique(N,event_id); one historic cycle despite reporting duplicates. |

## proceeding

Zero baseline rows; preserve raw proceedings-like text until evidenced binding.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `id_namespace` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `office_id` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `history_key` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `proceeding_id` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `kind` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `sequence_no` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `supersedes_id` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `legal_outcome` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `lineage_id` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `release_id` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |
| `raw_json` | Zero rows authored. No separately evidenced round/repeat proceeding; candidate preferences and reporting levels are not proceedings. Future row needs sourced ID, event FK, kind/sequence and claims. | Zero baseline rows; preserve raw proceedings-like text until evidenced binding. |

## source

PK(country,L,sid); original source hash and exact URL.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `country_id` | Constant netherlands; FK country.country_id. | PK(country,L,sid); original source hash and exact URL. |
| `source_namespace` | Constant L; never latest global release alias. | PK(country,L,sid); original source hash and exact URL. |
| `source_id` | S /i/source_id from exact URL; archive members keep archive source identity. | PK(country,L,sid); original source hash and exact URL. |
| `publisher` | S /i/publisher actual official host, not invented person. | PK(country,L,sid); original source hash and exact URL. |
| `title` | S /i/input_path filename as artifact title; upstream title retained raw if supplied. | PK(country,L,sid); original source hash and exact URL. |
| `url` | S /i/url exact successful endpoint. | PK(country,L,sid); original source hash and exact URL. |
| `checked_as_of_label` | S /i/checked_as_of_label=2026-09-19. | PK(country,L,sid); original source hash and exact URL. |
| `evidence_grade` | NULL; official origin does not automatically certify a research derivative. | PK(country,L,sid); original source hash and exact URL. |
| `file_sha256` | S /i/sha 256 exact retrieved bytes. | PK(country,L,sid); original source hash and exact URL. |
| `locator` | S /i/input_path; original member/sheet/XPath in evidence_link. | PK(country,L,sid); original source hash and exact URL. |
| `data_rights` | Literal unknown (DDL NOT NULL), unless an explicit source-specific licence is reviewed; Amsterdam metadata cc_by preserved raw. Never SQL NULL or invented universal licence. | PK(country,L,sid); original source hash and exact URL. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(country,L,sid); original source hash and exact URL. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(country,L,sid); original source hash and exact URL. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(country,L,sid); original source hash and exact URL. |

## party_mapping

Zero baseline rows; no unsupported harmonization.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `country_id` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `party_namespace` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `mapping_id` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `source_context` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `election_context` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `original_label` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `original_code` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `mapped_group` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `uncertainty` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `lineage_id` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `release_id` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |
| `raw_json` | Zero rows authored. No accepted cross-election party-family mapping. Keep exact list labels/numbers on result_row; no silent coalition/party harmonization. Future mapping requires scoped source/election and reviewed evidence. | Zero baseline rows; no unsupported harmonization. |

## result_row

PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `id_namespace` | Constant N=cdd-observatory-v1; part of office/event/result identities. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `office_id` | O/E/R /i/office_id exactly; FK (N,office_id). | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `history_key` | E/R /i/history_key exactly; FK (N,office_id,HK). | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `result_row_id` | R /i/result_row_id; exact scoped result token/vector. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `proceeding_id` | NULL baseline. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `country_id` | Constant netherlands; FK country.country_id. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `candidate_or_list_label` | R /i/candidate_or_list_label; blank EML RegisteredName→NULL typed label, preserve original empty string raw. Never invent party/person name. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `original_party_label` | R /i/original_party_label; Rotterdam candidate rows NULL; empty original preserved raw. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `original_party_code` | R /i/original_party_code if supplied; raw affiliation_id also retained. No global party code inferred. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `party_namespace` | NULL baseline. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `party_mapping_id` | NULL baseline. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `votes` | R /i/votes integer or NULL. Long CSV supplied unweighted vote metric, EML list ValidVotes, or explicitly documented sum of reported components. Never weighted Senate value into same unit. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `votes_status` | R /i/votes_status: positive recorded,0 zero,NULLunknown. Evidence qualification separate. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `share` | R /i/share only published percent (Amsterdam/Rotterdam). NULL elsewhere; no computed ratio. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `share_status` | R /i/share_status; zero/recorded/unknown paired with value. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `share_unit` | percent_0_100. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `seats` | R /i/seats from supplied LijstAantalZetels only; absent metric NULL even losing list; no rank/candidate-count inference. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `seats_status` | R /i/seats_status exactly; missing≠zero. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `elected_flag` | R /i/elected_flag=1 only explicit Rotterdam seat icon; otherwise NULL, not inferred false or list-seat winner. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `is_substitute` | NULL; no substitute appointment projection. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `evidence_status` | R /i/evidence_status; preliminary 2022 EML; disputed withheld Leeuwarderadeel 2014 collapsed vector; recorded other retained observations. Recorded does not imply legal certification. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | PK(N,oid,HK,rid), unique(N,rid); valid scalar/status pairs; no cross-unit aggregation. |

## record_locator

Exactly one DDL target shape; irrelevant target columns NULL.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `record_key` | rec-+H([entity_kind,...PKcomponents]); exact Identity Rules tuples. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `entity_kind` | Exact enum country/geography/office/event/result_row/source/input. No proceedings/party mappings baseline. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `country_id` | netherlands for typed targets except input; input target NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `geography_id` | Actual gid only for geography target; all other kinds NULL (including office). | Exactly one DDL target shape; irrelevant target columns NULL. |
| `id_namespace` | N only for office/event/result_row; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `office_id` | oid only for office/event/result_row; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `history_key` | HK only for event/result_row; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `proceeding_id` | NULL baseline. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `result_row_id` | rid only for result_row; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `party_namespace` | NULL baseline. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `party_mapping_id` | NULL baseline. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `source_namespace` | L only for source target; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `source_id` | sid only for source target; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `input_path` | Retained path only for input target; otherwise NULL. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Exactly one DDL target shape; irrelevant target columns NULL. |
| `source_row_locator` | C({input_path,sha 256,locator,derived_path,derived_pointer}); exact occurrence. Only one sparse target shape may be populated. | Exactly one DDL target shape; irrelevant target columns NULL. |

## evidence_link

Actual source/record/date FKs; broken resolved references fail closed.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `evidence_id` | ev-+H([record_key,input_path,locator,claim_kind]). | Actual source/record/date FKs; broken resolved references fail closed. |
| `record_key` | FK to real target locator; no orphan invented target. | Actual source/record/date FKs; broken resolved references fail closed. |
| `source_country_id` | netherlands. | Actual source/record/date FKs; broken resolved references fail closed. |
| `source_namespace` | Constant L; never latest global release alias. | Actual source/record/date FKs; broken resolved references fail closed. |
| `source_id` | Lookup S by evidence input_path; resolved source must exist. Missing known source→fatal. | Actual source/record/date FKs; broken resolved references fail closed. |
| `source_locator` | Exact evidence locator: CSV data rows exclude header; ZIP member+XPath; XLSX sheet/row; HTML XPath/main text. Hash validates original bytes. | Actual source/record/date FKs; broken resolved references fail closed. |
| `claim_kind` | register_identity, result_vector, ballot_date, institutional_scope, next_cycle_metadata or review_gap as applicable. | Actual source/record/date FKs; broken resolved references fail closed. |
| `date_claim_id` | Actual research_date FK for date claim, otherwise NULL. | Actual source/record/date FKs; broken resolved references fail closed. |
| `claim_json` | C(original fields + derivation/qualification); do not invent quotation, certification or denominator. | Actual source/record/date FKs; broken resolved references fail closed. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Actual source/record/date FKs; broken resolved references fail closed. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Actual source/record/date FKs; broken resolved references fail closed. |

## unresolved_evidence

Existing real locator and nonempty original token; no fake source FK.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `unresolved_id` | unres-+H([record_key,original_token,input_path,locator]). | Existing real locator and nonempty original token; no fake source FK. |
| `record_key` | Existing input/office/event locator according to named unresolved claim. | Existing real locator and nonempty original token; no fake source FK. |
| `original_token` | Exact unresolved source token; cannot be empty. Baseline U /0 is the named 18 November 2026 merger successor claim; bind unresolved_evidence to its retained input locator. | Existing real locator and nonempty original token; no fake source FK. |
| `source_locator` | Original source input/member/row or report gap pointer; no invented URL. | Existing real locator and nonempty original token; no fake source FK. |
| `reason` | Explicit missing evidence/binding/conflict reason; never disguise broken resolved FK as unresolved. | Existing real locator and nonempty original token; no fake source FK. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Existing real locator and nonempty original token; no fake source FK. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Existing real locator and nonempty original token; no fake source FK. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Existing real locator and nonempty original token; no fake source FK. |

## identity_crosswalk

Scoped upstream identity→existing same-kind record locator.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `entity_kind` | Same enum as target locator. | Scoped upstream identity→existing same-kind record locator. |
| `upstream_namespace` | CBS/NL/municipality or CBS/NL/province; Kiesraad/<election source>/<entity kind>; Rotterdam/wijkraadsverkiezing 26; Amsterdam/BC 2026. Scope reused IDs. | Scoped upstream identity→existing same-kind record locator. |
| `upstream_id` | Original GM/PV/domain/body token; event election identifier; result scoped list/candidate token. Array row numbers not public IDs. | Scoped upstream identity→existing same-kind record locator. |
| `record_key` | Existing resolved target locator key. | Scoped upstream identity→existing same-kind record locator. |
| `reason` | Deterministic evidenced identity or reviewed refinement; no name-only successor/party merge. | Scoped upstream identity→existing same-kind record locator. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Scoped upstream identity→existing same-kind record locator. |
| `release_id` | Candidate R from inventory fingerprint; never an attempt ID or other lineage release. | Scoped upstream identity→existing same-kind record locator. |
| `raw_json` | C({origin,source_row,qualifiers,evidence}) containing complete authored row and all unknown fields; original source bytes remain retained_input. No information dropped. | Scoped upstream identity→existing same-kind record locator. |

## ingest_attempt

Separate durable ledger survives failed staging; no records executed here.

| Destination column | Source locator → conversion / NULL policy | Evidence, identity / validation |
|---|---|---|
| `attempt_id` | Future fresh attempt-UUID each run; no attempt created here. | Separate durable ledger survives failed staging; no records executed here. |
| `lineage_id` | Constant L; ownership FK to selected Netherlands publication member. | Separate durable ledger survives failed staging; no records executed here. |
| `operator` | Actual future initiator, not invented Justin acceptance. | Separate durable ledger survives failed staging; no records executed here. |
| `script_version` | Actual future importer version; not implemented here. | Separate durable ledger survives failed staging; no records executed here. |
| `started_at` | Actual future UTC ledger start, durable before staging. | Separate durable ledger survives failed staging; no records executed here. |
| `finished_at` | NULL until completion, then actual UTC. | Separate durable ledger survives failed staging; no records executed here. |
| `status` | Future started/succeeded/failed per ledger; no succeeded row authored here. | Separate durable ledger survives failed staging; no records executed here. |
| `input_inventory_json` | C(actual effective inventory and provenance at future attempt). | Separate durable ledger survives failed staging; no records executed here. |
| `successful_release_id` | R only on reconciled successful publication; NULL on failure. | Separate durable ledger survives failed staging; no records executed here. |
| `publication_set_json` | NULL while started or failed; on success full lineage/release array, preserving unrelated members. | Separate durable ledger survives failed staging; no records executed here. |
| `row_counts_json` | Actual measured execution counts; no documentary count represented as executed. | Separate durable ledger survives failed staging; no records executed here. |
| `error_text` | Nonempty actual failure message on failed; NULL for started/succeeded. Do not fabricate. | Separate durable ledger survives failed staging; no records executed here. |

## Publication protocol — future implementation only

Start and durably commit an ingest_attempt in the separate ledger. Lock writer; consistent backup; stage on same filesystem while preserving other lineages. Validate approved tiers/effective-input hashes, IDs, scalar/date semantics, fixtures, foreign keys and integrity. Failure discards staging and records failure without changing served publication. No omission-driven deletion, no INSERT OR REPLACE. Include inherited dependencies on partial refresh.

On success checkpoint WAL with no busy frames, close staging connections, fsync, atomic rename, directory fsync; retain rollback backup. Readers reopen read-only. Reconcile publication_receipt and ledger after crash. Unchanged inputs keep R but get newattempt. Netherlands citations always use its own publication member. Importer, SQLite, VPS, UI and redirects **Not run**.
