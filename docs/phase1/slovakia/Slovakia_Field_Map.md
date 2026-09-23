# Slovakia → Atlas field map

Draft research handoff. Pinned main `89726607439fa6726e7c34e30eec45357230d318`. The 20 destination tables below cover **223 exact columns** in the unchanged Prompt B DDL. No database was opened or loaded.

## Source aliases and projection rules

`C`=data/research/slovakia/country.json; `O`=office-register.json; `G`=geography.json; `E`=events.json; `Pp`=proceedings.json; `Rr`=results.json; `S`=sources.json; `X`=identity-crosswalk.json; `K`=counts.json (all under data/research/slovakia). `T`=schemas/atlas/tiers/slovakia.json. `I`=Slovakia_Input_Inventory.json and `V`=Slovakia_Identity_Vectors.json in this folder. A row alias means its exact array index from V; source origins bind retained bytes and original row.

C(x) is compact sorted-key UTF-8 JSON; H(x)=SHA256(C(x)); key(prefix,x)=prefix+"-"+H(x)[0:24]. L=country-package-slovakia; N=cdd-observatory-v1; R=I.candidate_release_id. These are documentary identities pending acceptance.

All raw CSV columns and XLSX cells survive in result.raw.columns/values and exact retained originals. Grouping whitespace/decimal-comma conversion affects typed numbers only. No source value is recomputed. `NaN`, blank and dash mean missing where present; literal0 stays zero. Labels/diacritics remain source spelling. No JSON field is discarded for lack of a DDL column.

The full source catalogue and dispositions are in source-projection.json. National party totals are used once; territorial/precinct/personal-preference tables remain retained evidence, not extra national results. Local 2014/2018 elected lists are incomplete candidate vectors.2022 all-candidate tables supply full published candidate rows; elected lists do not add duplicates.2013 VUC second-round composition is not a second assembly result set.

Event creation is result-backed for historical cycles. The 44 missing local office/cycle bindings remain gaps, not fabricated completed events.2026 call creates prospective cycles only. President and 2013 VUC chair ballots attach to one cycle through proceeding. Proceedings have no date column in DDL: retain Pp.date raw and attach its research_date through evidence_link.date_claim_id.

## Sparse locator shapes

| entity_kind | Populated target columns; all other target columns NULL |
|---|---|
| country | country_id |
| geography | country_id, geography_id |
| office | country_id, id_namespace, office_id |
| event | country_id, id_namespace, office_id, history_key |
| proceeding | country_id, id_namespace, office_id, history_key, proceeding_id |
| result_row | country_id, id_namespace, office_id, history_key, result_row_id |
| party_mapping | country_id, party_namespace, party_mapping_id |
| source | country_id, source_namespace, source_id |
| input | input_path |

## dataset_lineage

PK L.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `lineage_id` | I.lineage_id | L | PK L. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `provenance_kind` | constant | country_package | PK L. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `description` | C.notes | New sourced Slovakia research; historical and research coverage partial. | PK L. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## dataset_release

PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `fingerprint_sha256` | I.fingerprint_sha256 | H(I.hash_inputs), not ZIP/filemtime/attempt time. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `hash_inputs_json` | I.hash_inputs | Canonical UTF-8 sorted-key JSON including effective inputs, tiers, overrides=[], adapter/method/schema and DDL hashes. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `adapter_version` | I.hash_inputs.adapter_version | atlas-slovakia-full-register/1 | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `method_version` | I.hash_inputs.method_version | atlas-preserve-evidence/1 | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `schema_version` | I.hash_inputs.schema_version | atlas-master/1 | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `research_snapshot_label` | C.research_snapshot_label | 2026-09-21 retrieval label; not election date. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `upstream_release_id` | no previous public Slovakia alias | NULL; do not borrow another country/LatAm alias. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `validated_counts_json` | K, future verified counts | Canonical counts after future import validation; this pack is not a publication receipt. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `research_coverage_complete` | C.research_coverage_complete | 0; incomplete earlier cycles, historical predecessors, replacement events and some vectors. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(L,R); UNIQUE(L,fingerprint). Immutable release metadata. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## publication_release

One selected R per L; publication is complete set of pairs.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | One selected R per L; publication is complete set of pairs. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | One selected R per L; publication is complete set of pairs. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## publication_receipt

Singleton1 points to selected(L,R) and actual durable attempt; cross-DB audit is application responsibility.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `singleton` | runtime | 1 | Singleton1 points to selected(L,R) and actual durable attempt; cross-DB audit is application responsibility. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `last_publish_attempt_id` | ledger current attempt | Fresh runtime attempt ID; different from release ID. | Singleton1 points to selected(L,R) and actual durable attempt; cross-DB audit is application responsibility. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `attempted_lineage_id` | I.lineage_id | L | Singleton1 points to selected(L,R) and actual durable attempt; cross-DB audit is application responsibility. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `attempted_release_id` | candidate selected release | R after validated staging. | Singleton1 points to selected(L,R) and actual durable attempt; cross-DB audit is application responsibility. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## retained_input

PK(L,R,input_path); exact classification composite FK includes kind+hash.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `input_path` | I.hash_inputs.inputs[].input_path | Exact relative path. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `input_kind` | I.hash_inputs.inputs[].input_kind | artifact/package/tier_classification as declared. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `sha256` | I.hash_inputs.inputs[].sha256 | Exact file byte hash; verify before parsing. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `byte_count` | I.hash_inputs.inputs[].byte_count | Exact byte length. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `recovery_locator` | immutable accepted pack + input_path | Recover exact bytes; source URL plus ZIP member also retained. Do not claim local paths as URLs. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `payload_json` | parsed JSON inputs | Canonical full JSON for JSON inputs; NULL for CSV/XLSX/PDF/HTML/ZIP with exact bytes retained. No script execution. | PK(L,R,input_path); exact classification composite FK includes kind+hash. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## country

PK slovakia; release FK(L,R).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `country_id` | C.country_id | Literal slovakia. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `country_code` | C.country_code | SK | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `name` | C.name | Slovenská republika | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `polity_kind` | C.polity_kind | sovereign_country | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `region_id` | C.region_id | europe; not a tier. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `coverage_status` | C.coverage_status | partial | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `screening_as_of_label` | C.screening_as_of_label | 2026-09-21 | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `notes` | C.notes + research-gaps.json | Join readable notes; retain arrays in raw_json. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK slovakia; release FK(L,R). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## geography

PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `country_id` | C.country_id | Literal slovakia. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `geography_id` | G.geography_id / O.geography_id | Exact country-scoped geography key. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `name` | G.name | Exact official Slovak orthography. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `parent_geography_id` | G.parent_geography_id | SK for regions; SK-VUC-code for municipalities; sourced parent city for 39 parts; NULL for country. No guessed successor/appointed district office. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `effective_from_label` | G.valid_from | NULL; source snapshot is not legal founding date. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `effective_to_label` | G.valid_to | NULL; source omission is not abolition. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(slovakia,G); nullable parent FK(slovakia,parent); no cycles. | 2,935 geographies; official city-part parents; no cycles. |

## research_date

PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `date_id` | V.research_dates[].date_id | date-+H([N,ownerType,ownerID,slot]); event/election, office/next, proceeding/ballot. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `label` | O.next_date / E.date / Pp.date .label | Exact sourced label. Actual recovered dates are day precision; unknown next dates remain absent. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `precision` | date.precision | day here; future year/month/range/unknown must remain that precision. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `certainty` | date.certainty | called for recovered official call/occurrence; no assumed certainty from a term. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `year` | date.year | Source year; NULL if unknown/range. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `month` | date.month | Source month; NULL if year/unknown/range. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `day` | date.day | Source day; NULL if lower precision. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `range_start_id` | no recovered ranges | NULL; future ordered endpoints must be separately sourced non-range dates. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `range_end_id` | no recovered ranges | NULL. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK owner-scoped date ID; dates and origins in V; range endpoints require valid FKs. | No term/date invention; full-day claims sourced; unknown/partial synthetic gates isolated. |

## office

PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `id_namespace` | O/E/Rr.id_namespace | Literal cdd-observatory-v1; include in every office/event/result FK. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `office_id` | O.office_id / E.office_id / Rr.office_id / Pp.office_id | Exact documentary office ID; preserve source territorial codes; no random IDs. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `country_id` | C.country_id | Literal slovakia. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `geography_id` | G.geography_id / O.geography_id | Exact country-scoped geography key. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `name` | O.office_name | Official jurisdiction name plus disclosed statutory body descriptor; never claimed as an official combined title. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `office_type` | O.office_type | Keep council, direct mayor, city-part body, regional assembly/chair, national chamber, president and EP delegation distinct from geographic tier. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `office_status` | O.office_status | current for 5,871 recovered rows. Historical-only recovery is0 with named gap, not proof no abolished bodies existed. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `record_state` | adapter constant | active. Absence in an incomplete refresh does not withdraw. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `state_note` | adapter constant | NULL while active; explicit withdrawal requires sourced nonempty reason. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `registry_qualified` | draft review state | 0 until accepted and applicable qualification gates resolved. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `next_date_id` | O.next_date | date-+H([N,office,O.office_id,next]) for 5,868 local/VUC offices; NULL for 3 national/EP offices. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `next_date_resolution` | O.next_date | resolved when supplied; unknown otherwise. Conflicting future claims require NULL pointer and conflicting state. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `next_history_key` | O.next_cycle | O.office_id+::+O.next_cycle if nonnull; otherwise NULL. Must resolve to the existing prospective E row. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(N,O); FK(country,G), mutual classification FK(N,O), next event FK(N,O,HK). | 5,871 unique current IDs; all match tier set; no appointed/military/PM IDs. |

## office_tier_classification

PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `id_namespace` | O/E/Rr.id_namespace | Literal cdd-observatory-v1; include in every office/event/result FK. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `office_id` | O.office_id / E.office_id / Rr.office_id / Pp.office_id | Exact documentary office ID; preserve source territorial codes; no random IDs. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `tier` | T.classifications[].tier | national→national_context; regional/municipal/other unchanged; future unknown→NULL, never other. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `review_status` | T.status / row flags | needs_review for every known draft tier, even focused flag=false; never approved in this pack. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `rationale` | T.classifications[].rationale | Exact nonempty wording and evidence. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `classification_path` | constant | schemas/atlas/tiers/slovakia.json | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `classification_kind` | constant | tier_classification | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `classification_sha256` | I.tier_file.sha256 | ce8c24f7fcc2f41439f16fca0ad428312de913815c542d3c5c46e28275559770 | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(N,O); FK office and retained_input(L,R,path,tier_classification,hash). | 5,871 rows; draft only;5774municipal/16regional/2national/79other. |

## election_event

PK(N,O,HK); UNIQUE(N,event_id); FK office/date.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `id_namespace` | O/E/Rr.id_namespace | Literal cdd-observatory-v1; include in every office/event/result FK. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `office_id` | O.office_id / E.office_id / Rr.office_id / Pp.office_id | Exact documentary office ID; preserve source territorial codes; no random IDs. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `history_key` | E/Rr/Pp.history_key | Exact office_id::cycle, round-independent; never date-derived. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `event_id` | E.event_id | key(event,[N,O,HK]); stable through date corrections. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `date_id` | E.date | date-+H([N,event,E.event_id,election]); actual row required even for unknown date. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `date_resolution` | E.date.precision | resolved here. Unknown precision needs explicit unknown research_date; conflicting claims have NULL event pointer. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `event_kind` | E.event_kind | ordinary for recovered cycles; no invented repeat/by-election. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `selected_history_role` | E.selected_history_role | selected for 17,569 historical cycles; none for 5,868 prospective cycles. Not a certification or complete-vector flag. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `electoral_system` | O.electoral_mode + E.cycle | direct_popular, with two-round presidential and 2013 VUC-chair mechanics retained in raw. Council candidate-mark vs national list vote grain remains explicit. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `comparability` | E.coverage + ballot_basis + result district | elected_only is not comparable to an all-candidate vector; preserve district keys and round. Serialize these limitations as text. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `ballot_basis` | E.ballot_basis | candidate_marks for local/regional assemblies; list_votes for NRSR/EP; valid_votes for executives. Do not sum council shares across districts. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `share_unit` | E/Rr.share_unit | percent_0_100; no rescaling. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `legal_outcome` | E/Pp.legal_outcome | unknown. Official published return is not an invented court/certification proceeding. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `record_state` | adapter constant | active. Absence in an incomplete refresh does not withdraw. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `state_note` | adapter constant | NULL while active; explicit withdrawal requires sourced nonempty reason. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(N,O,HK); UNIQUE(N,event_id); FK office/date. | 23,437 cycles;17,569 historical+5,868prospective; rounds not extra cycles. |

## proceeding

PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `id_namespace` | O/E/Rr.id_namespace | Literal cdd-observatory-v1; include in every office/event/result FK. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `office_id` | O.office_id / E.office_id / Rr.office_id / Pp.office_id | Exact documentary office ID; preserve source territorial codes; no random IDs. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `history_key` | E/Rr/Pp.history_key | Exact office_id::cycle, round-independent; never date-derived. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `proceeding_id` | Pp.proceeding_id / Rr.proceeding_id | Exact round key when supplied; NULL on single-round result rows. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `kind` | Pp.kind | first_round or runoff only when actual round source supplies it. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `sequence_no` | Pp.sequence | 1 or2 as supplied;19 total proceedings. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `supersedes_id` | Pp.supersedes_id | NULL. A runoff continues a cycle and does not annul its first round. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `legal_outcome` | E/Pp.legal_outcome | unknown. Official published return is not an invented court/certification proceeding. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(N,O,HK,P); UNIQUE(N,P); same-event supersession only. | 19 actual rounds;13 VUC2013 chair+6 presidential; no synthetic certification. |

## source

PK(slovakia,L,source_id); release FK(L,R).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `country_id` | C.country_id | Literal slovakia. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `source_namespace` | S.source_namespace | Literal L; source key always (slovakia,L,source_id). | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `source_id` | S.source_id / origin.source_id | Exact source documentary key; resolve against sources.json; a broken known key fails closed. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `publisher` | S.publisher | Official statistics office, Interior Ministry or Slov-Lex attribution; NULL if not evidenced. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `title` | S.title | NULL where title not separately transcribed; URL is not a fabricated title. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `url` | S.url | Exact acquisition URL. Extracted members retain container URL plus member identity. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `checked_as_of_label` | S.checked_as_of_label | 2026-09-21 acquisition, not election date. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `evidence_grade` | S.evidence_grade | official_publication; role of each source is declared in source-projection.json, not all files supply returns. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `file_sha256` | S.sha256 | Exact retained bytes; member hash differs from parent ZIP hash. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `locator` | S.input_path + archive_member + parent_sha256 if any | Canonical descriptor; row-specific origin on evidence_link. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `data_rights` | S.data_rights | unknown; no licence invented. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(slovakia,L,source_id); release FK(L,R). | 187 exact retained source descriptors; every known origin resolves with matching hash. |

## party_mapping

Zero rows. Future PK(country,party_namespace,mapping_id).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `country_id` | C.country_id | Literal slovakia. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `party_namespace` | party-mappings.json=[] | NULL for results; no party_mapping rows emitted. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `mapping_id` | party-mappings.json=[] | No row emitted. Future sourced mapping gets a deterministic scoped key. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `source_context` | party-mappings.json=[] | No row; if later supplied, source document and locator required. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `election_context` | party-mappings.json=[] | No row; never unscoped national party equivalence. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `original_label` | party-mappings.json=[] | No row; raw party labels remain on result_row. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `original_code` | party-mappings.json=[] | No row; event-scoped source codes remain on result_row. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `mapped_group` | party-mappings.json=[] | No row; no coalition splitting, successor equivalence or invented canonical party. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `uncertainty` | party-mappings.json=[] | No row; any later uncertain mapping must be explicit. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | Zero rows. Future PK(country,party_namespace,mapping_id). | Exactly0; party labels are preserved, not harmonized. |

## result_row

PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `id_namespace` | O/E/Rr.id_namespace | Literal cdd-observatory-v1; include in every office/event/result FK. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `office_id` | O.office_id / E.office_id / Rr.office_id / Pp.office_id | Exact documentary office ID; preserve source territorial codes; no random IDs. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `history_key` | E/Rr/Pp.history_key | Exact office_id::cycle, round-independent; never date-derived. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `result_row_id` | Rr.result_row_id | Exact result key; includes namespace,office,cycle,round,candidate source key. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `proceeding_id` | Pp.proceeding_id / Rr.proceeding_id | Exact round key when supplied; NULL on single-round result rows. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `country_id` | C.country_id | Literal slovakia. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `candidate_or_list_label` | Rr.candidate_or_list_label | Exact source name or source first+last joined with one space; diacritics retained. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `original_party_label` | Rr.original_party_label | Exact original party/coalition string, NULL if absent; never split or harmonize. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `original_party_code` | Rr.original_party_code | Source list code scoped to event; NULL when no code is supplied. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `party_namespace` | party-mappings.json=[] | NULL for results; no party_mapping rows emitted. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `party_mapping_id` | party-mappings.json=[] | NULL; no cross-party equivalence inferred. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `votes` | Rr.votes | Nonnegative integer from exact source cell; strip grouping whitespace and parse decimal separator only. Never derive votes from shares. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `votes_status` | Rr.votes_status | zero for printed0; recorded for positive; unknown for absent. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `share` | Rr.share | Exact published percentage; no clamp, scaling, renormalization or recomputation. Withdrawn-candidate claims remain as supplied with raw markers. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `share_status` | Rr.share_status | zero/recorded/unknown by exact supplied value. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `share_unit` | E/Rr.share_unit | percent_0_100; no rescaling. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `seats` | Rr.seats | Published party mandate total only. Candidate winner does not imply a synthesized seat1. Blank/NaN stays NULL. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `seats_status` | Rr.seats_status | zero/recorded/unknown by exact supplied value. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `elected_flag` | Rr.elected_flag | True only when winner source/marker explicitly identifies elected status. Others NULL, not automatically false.2013 VUC assembly same-name ambiguity leaves all flags NULL. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `is_substitute` | no normalized substitution claims | NULL; raw markers retained. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `evidence_status` | Rr.evidence_status | recorded means source claim, not certified or complete. Disputed future claims require explicit status/accepted override. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(N,O,HK,result_row_id); UNIQUE(N,result_row_id); FK full office/event/proceeding tuples; mapping pair bothNULL. | 115,217 unique rows; votes/share/seats match source cells; no national+territorial double-count. |

## record_locator

One sparse target shape only; see table immediately below; typed FKs enforced.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `record_key` | V.*[].record_key; input/country rules in identity doc | rec-+H([entityKind,...typedKeyParts]); not a public replacement ID. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `entity_kind` | projected typed record kind | One of country/geography/office/event/proceeding/result_row/source/input; party_mapping empty. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `country_id` | typed target field country_id | Populate only for country, geography, office, event, proceeding, result_row, party_mapping, source; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `geography_id` | typed target field geography_id | Populate only for geography; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `id_namespace` | typed target field id_namespace | Populate only for office, event, proceeding, result_row; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `office_id` | typed target field office_id | Populate only for office, event, proceeding, result_row; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `history_key` | typed target field history_key | Populate only for event, proceeding, result_row; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `proceeding_id` | typed target field proceeding_id | Populate only for proceeding; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `result_row_id` | typed target field result_row_id | Populate only for result_row; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `party_namespace` | typed target field party_namespace | Populate only for party_mapping; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `party_mapping_id` | typed target field party_mapping_id | Populate only for party_mapping; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_namespace` | typed target field source_namespace | Populate only for source; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_id` | typed target field source_id | Populate only for source; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `input_path` | typed target field input_path | Populate only for input; NULL for every other kind. Result locators keep proceeding_id NULL even when result_row has one. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_row_locator` | derived path+JSON pointer+origins | Canonical locator. JSON pointers0-based; CSV record 1-based including preamble/header; XLSX sheet androw1-based; PDF page 1-based. | One sparse target shape only; see table immediately below; typed FKs enforced. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## evidence_link

PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `evidence_id` | target + origin + claim kind | ev-+H([record_key,[slovakia,L,source_id],originWithoutSourceID,claim_kind]); exact full hash. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `record_key` | typed target V record key | Must resolve to record_locator. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_country_id` | constant | slovakia | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_namespace` | S.source_namespace | Literal L; source key always (slovakia,L,source_id). | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_id` | S.source_id / origin.source_id | Exact source documentary key; resolve against sources.json; a broken known key fails closed. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `source_locator` | O/G/E/Rr origins; date.origins | Canonical exact path+hash+CSV record/XLSX sheet,row/PDF page/HTML id; never fake a JSON pointer into CSV. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `claim_kind` | projected field role | identity/geography/date/result/provenance; no certification fabricated. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `date_claim_id` | date evidence only | Matching V research_date ID; NULL for non-date evidence. Proceeding dates link here and remain raw; DDL has no proceeding.date_id. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `claim_json` | full supplied claim and raw source cells | Canonical full claim; disputed alternatives stay separately retained. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK full evidence hash; FK record_key and(slovakia,L,source_id), optional date_claim_id. | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## unresolved_evidence

Zero rows now. Future real target record_key; deliberately no fabricated source FK.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `unresolved_id` | unresolved-evidence.json=[] | No actual unresolved citation token normalized in this pack. Future exact token: unres-+H([record_key,token,locator]). | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `record_key` | future unresolved target | Must reference a real locator, never a fabricated source row. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `original_token` | future exact unresolved citation token | Preserve nonempty token verbatim; do not invent tokens to represent ordinary research gaps. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `source_locator` | future original token occurrence | Required retained path+hash+location. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `reason` | future failure-to-resolve evidence reason | Nonempty reason. Broken known source FK is an error, never reclassified as unresolved. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | Zero rows now. Future real target record_key; deliberately no fabricated source FK. | Exactly0 real normalized tokens; future broken resolved references fail closed. |

## identity_crosswalk

PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind).

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `entity_kind` | X.entity_kind | office | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `upstream_namespace` | X.upstream_namespace | statistics.sk:OSO:territorial-code:C or M, including body qualification. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `upstream_id` | X.upstream_id | Exact 6-digit territorial code, no numeric trimming. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `record_key` | X.record_key | FK to real office record locator. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `reason` | X.reason | Source-code binding only, not legal merger/successor link.2014 name-binding file supplies additional exact evidence aliases. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `release_id` | I.candidate_release_id | Candidate only; mint public release only after future validated publication. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |
| `raw_json` | Entire source-bound object + origins + raw columns/values | Canonical JSON retaining all unknown fields, original claims, holds and source row; never drop columns. | PK(entity_kind,upstream_namespace,upstream_id); FK(record_key,entity_kind). | Exact source preservation; full release ownership; missing≠zero; no invented columns. |

## ingest_attempt

Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt.

| Column | Source locator | Conversion / null policy | Identity / evidence / FK | Validation assertion |
|---|---|---|---|---|
| `attempt_id` | future runtime | Fresh attempt-UUID every run, excluded from fingerprint; no attempt minted here. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `lineage_id` | I.lineage_id | Literal country-package-slovakia; preserve row ownership. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `operator` | future authenticated operator | Required actual operator, not Justin approval inferred. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `script_version` | future executable version | Actual importer version; documentation adapter contract is not execution. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `started_at` | runtime UTC | Before staging begins; durable sibling ledger. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `finished_at` | runtime UTC | NULL while started; actual finish on terminal state. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `status` | runtime outcome | started→succeeded/failed; not run in this pack. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `input_inventory_json` | I + effective inherited descriptors | Canonical exact inputs to this attempt. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `successful_release_id` | future success | R only after publication/recovery confirms success; NULL on failure. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `publication_set_json` | future entire selected release set | Retain all unrelated lineage/release pairs unchanged. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `row_counts_json` | future actual validated counts | Not documentary expectations alone. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |
| `error_text` | future error | NULL on success; preserved failure reason on rollback. | Separate durable ledger PK attempt_id; no SQLite cross-DB FK; reconcile with receipt. | Execution Not run; unchanged future input→new attempt,same R; failed staging does not erase ledger. |

## Publication and conflicts

Implementation remains pending. Production must fail closed on unaccepted tiers or overrides, fixture material, broken known FKs, hash mismatch, domain errors or conflicting single-value claims. A source-backed conflict is retained as separate evidence; no silent numeric alternate, clamp or NULL coercion. Future accepted atlas-override/1 changes require exact target tuple, expected_original guards, replacement/status bundle, reason, origin and claims; preserve the predecessor hash and original evidence.

Build staging on the same filesystem from a consistent backup; log attempt durably in the sibling ledger before loading. Preserve unrelated releases and rows. Validate FKs/integrity/counts/semantic references; checkpoint and close WAL; fsync; atomic rename; fsync directory; reopen readers. Failure keeps last good publication. Startup reconciles receipt/ledger interruption. No such operation was performed here.

Incomplete-refresh carry-forward requires retained source bytes and their hashes in effective inputs. Never INSERT OR REPLACE/delete omitted offices. Country/party/source namespace ownership must remain lineage-specific. No redirects or UI changes are authorized.
