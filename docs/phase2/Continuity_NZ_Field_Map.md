# New Zealand → Atlas continuity field map

Phase 2 / cutover-gate documentation, 2026-09-16. Scope is the already-public small New Zealand batch; Europe remains the launch landing. No frozen bytes, DDL, rows, importer or UI are changed.

## Governing-file availability

Main was freshly fetched and is still `5f46f9b03f24f4776ffb09feb390906b0ca75fdb` (PR #17 merge). The requested `schemas/atlas/migrations/0001_atlas_attempt_log.sql`, `0002_atlas_master.sql`, `docs/phase0/` and `docs/phase1/` files **are absent on this main**. This map uses the previously delivered, unchanged Prompt B files `001_atlas_attempt_log.sql` (SHA-256 e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1) and `001_atlas_master.sql` (1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da), plus the saved Prompt B rationale, all four Albania Prompt C documents, and Phase 0 continuity-counts.json / Election_Atlas_Phase0_Report.md. It does not claim the requested renumbered migrations were read from git. Before implementation, land/verify the stated unchanged contract at the requested paths; reject a materially different schema pending an explicit mapping revision. Albania is not reopened or edited.

## Verified baseline and source paths

`L=country-package-new-zealand` exactly. J=`data/countries/new-zealand/dataset.json`, SHA-256 **6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133**. Other tracked package files are README.md and validate.mjs. The existing read-only package validator passed 4 races,11 prospective candidates,3 histories and 36 historical result rows. The source snapshot is 2026-09-15; upcoming window2026-09-08 through2028-03-08. Coverage remains partial.

| Measure | Verified value |
| --- | ---: |
| Country / offices / geographies | 1 /4 /4 |
| Prospective / historical events | 4 /3 |
| Historical result rows | 36 |
| Prospective candidates retained only | 11 |
| Sources | 12 |
| Proceedings / party mappings / original HTML briefings | 0 /0 /0 |
| Historical results with supplied elected=true | 18 |
| Historical rows with missing vote share | 36 |

Every actual prospective event supplies **day precision**. Clutha's closing time is null, but its 2026-10-16 date is supplied. Do not turn missing time into unknown day or invent a noon deadline. No month/year-only NZ event is claimed in this package; partial-date tests are explicitly separate fixtures, and real LatAm partial dates supply additional coverage.

| Alias | Exact path |
| --- | --- |
| J | data/countries/new-zealand/dataset.json |
| U | J `/races/i` |
| H | J `/histories/i` |
| V | H `/results/j` (only historical results) |
| S | J `/sources/i` |
| Candidate | U `/candidates/j` (retained input only; not a result/officeholder claim) |
| T | schemas/atlas/tiers/new-zealand.json (absent) |

Bridge identity rules are read from `lib/observatory/adapters/new-zealand.ts`, `adapters/europe.ts` packageRelease, and `scripts/import/normalize.ts` key/stable/date helpers on pinned main. Mapping preserves identities while avoiding unsourced bridge defaults such as isSubstitute=false. No bridge metric recomputation is run.

## Mapping conventions

Every destination column has a row below. See [identity rules](Continuity_Identity_Rules.md) for C(), key(), stable IDs, exact inventories, release aliases and publication protocol; [acceptance examples](Continuity_Acceptance_Examples.md) and [checklist](Prompt_D_Continuity_Checklist.md) specify future CI. `N=cdd-observatory-v1`; `R=L+"--sha256-"+fingerprint` for new Atlas continuity releases, subject to reuse of an existing identical release. Existing public IDs remain unchanged. No release is minted by this documentation.

An **origin** is `{input_path, sha256, decoded_json_pointer, archive_member, original_row_id, retained_input_path}`; unused fields are null. JSON pointers use RFC6901 escaping and zero-based indices into actual decoded arrays. Archive member origins include container hash and member hash in supplemental metadata. A raw envelope is `{origin, row:<complete original object>, supplemental:[{origin,row}], operational:<labelled binding/override metadata>}`. Do not normalize or replace values inside row. Preserve complete files in retained_input, including fields outside typed projection. Stable citation occurrence = `[original input path, original owning record ID, field name, reference index]`; preserve this binding on reorder, use current physical pointer only as origin metadata.

SQL NULL means absent/unknown where permitted. Preserve supplied numeric value/status pairs; malformed numeric types fail rather than being guessed. Optional blank strings map to NULL only where explicitly stated; raw retains the original blank. Identity strings are exact, never trimmed or Unicode-normalized. Required identities/country/target references missing→fail closed. All active rows carry their **own** L/R pair and every FK is validated. No metric tables or computations. No regional-count minimum. Europe remains the default landing; one post-cutover SQLite data plane.

## Tier prerequisite

No checked-in Atlas tier-classification files for this lineage exist on inspected main. Legacy normalized tiers/bridge heuristics are retained only as raw context. **Import fails before publication until each office-bearing country has an accepted `schemas/atlas/tiers/<country_id>.json`** with exact office-set coverage (including historical IDs), source input SHA-256, rationale and review state. Do not synthesize all-unknown rows just to satisfy the mutual office/classification FK. Status-only countries need no file or dummy office.

Accepted file format: `schema_version:"atlas-tier-classification/1"`, `lineage_id:L`, `country_slug`, `status:"approved"`, `source_inputs:[{input_path,sha256}]`, `classifications:[{office_id,tier,rationale,human_review_required,tier_uncertain,evidence:[{input_path,sha256,json_pointer}]}]`. This is a prerequisite contract, **not a supplied classification**. Review vocabulary national/regional/municipal/other/unknown maps as documented in the column table; an explicitly reviewed unknown stays NULL/unknown and is excluded from approved regional counts. No positive regional count is required. Missing/unreviewed file is a failed lineage attempt while other lineages keep serving.

## dataset_lineage

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Reserved lineage contract | Exact L; see lineage constants below. Never replace with continent/global publication ID. | lineage_id | PK L; one source dataset, not one attempt. |
| provenance_kind | Manifest/package provenance | LatAm=latin_america_release; NZ=country_package. | lineage_id | Reject fixture/unsupported provenance. |
| description | Supplied package identity | Operational description: Latin America continuity input / New Zealand continuity input. | lineage_id | No completeness claim. |

## dataset_release

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | lineage_id, release_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | lineage_id, release_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| fingerprint_sha256 | Effective lineage inventory + tiers + overrides + versions | SHA256(C(hash_inputs)); exact Identity Rules object. | lineage_id, release_id | 64 lowercase hex; same L+digest reuses one immutable row. |
| hash_inputs_json | Retained descriptors, reviewed tier files and version contract | Canonical UTF-8 JSON; sorted arrays; explicit overrides=[]. | lineage_id, release_id | Only this lineage, including inherited inputs; no timestamps, attempts or other selected releases. |
| adapter_version | Continuity mapping contract | LatAm=atlas-latam-continuity/1; NZ=atlas-nz-continuity/1. | lineage_id, release_id | Exact match to hash_inputs field; change on semantic adapter changes. |
| method_version | Evidence/identity method | atlas-preserve-evidence/1. | lineage_id, release_id | Exact match to hash_inputs. |
| schema_version | Unchanged Prompt B DDL | atlas-master/1; accepted migration byte hashes in schema_inputs. | lineage_id, release_id | Verify DDL against saved contract; requested checked-in paths currently missing. |
| research_snapshot_label | J.snapshot_date | Copy 2026-09-15. | lineage_id, release_id | Not import date. |
| upstream_release_id | LatAm M.release.id / NZ packageRelease().id | Exact reserved legacy ID, equal to L. | lineage_id, release_id | Preserve original citation alias; pinned alias binding in raw_json, not latest attempt. |
| validated_counts_json | Recomputed inputs | Counts object per baseline, with selected/other/none separate. | lineage_id, release_id | Never label LatAm 40,509 as strictly selected; do not count NZ candidates as results. |
| research_coverage_complete | LatAm release.researchCoverageComplete / NZ coverage | false→0. | lineage_id, release_id | Software validation is not research completeness. |
| raw_json | J root metadata and complete retained-input pointer | Retain schema_version, coverage, conventions, research_window, release_status, pending_adapter. | lineage_id, release_id | No implication of complete national screen; upstream bridge versions separate from Atlas versions. |

## retained_input

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | lineage_id, release_id, input_path | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | lineage_id, release_id, input_path | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| input_path | Inventory logical path | Repo path for tracked bytes; archive/L/<entry> for exact archive members; inherited path convention in Identity Rules. | lineage_id, release_id, input_path | Unique (L, R, path), no traversal/symlinks; no basename-only matching. |
| input_kind | Input inventory class | Reviewed tiers=tier_classification; documented overrides=override; binaries/HTML/briefing shards=artifact; remaining research JSON/text/package code=package. | lineage_id, release_id, input_path | Exact class retained in fingerprint; no fixture inputs. |
| sha256 | Original retained bytes | Hash original compressed bytes for gzip files; original member bytes for archive members. | lineage_id, release_id, input_path | Do not confuse manifest gzip digest with decompressed object filename digest. |
| byte_count | Original retained bytes | Exact nonnegative byte length. | lineage_id, release_id, input_path | For archive members compare manifest.inventory[].bytes. |
| recovery_locator | Verified immutable byte store | sha256:<hash>; archive member uses sha256:<ziphash>!zip:<exact entry>. | lineage_id, release_id, input_path | Resolvable and rehashed before publication; missing bytes fail, not invented URLs. |
| payload_json | Whole JSON content, including unprojected fields | JSON original text; gzip JSON→decoded whole JSON; non-JSON→NULL. Original bytes separately recoverable. | lineage_id, release_id, input_path | No formula/HTML/script execution; metrics/gates remain here; gzip object content may be CSV/HTML rather than JSON. |

## country

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | J.country + existing bridge slug | new-zealand. | country_id | Preserve public slug. |
| country_code | J.country_code | NZ. | country_id | Actual supplied code, not inferred. |
| name | J.country | New Zealand, verbatim. | country_id | No invented alternate country entry. |
| polity_kind | Existing bridge country record | sovereign_country. | country_id | No tier implication. |
| region_id | J.region | Oceania→oceania. | country_id | Does not displace Europe default landing. |
| coverage_status | J.coverage national_screen_complete/latest_three_history_complete | partial. | country_id | Four included offices do not define a national denominator. |
| screening_as_of_label | No separate national-screen date supplied | NULL. | country_id | snapshot_date is a release snapshot, not completed national screening. |
| notes | J.conventions.scope | Verbatim scope; retain full conventions/coverage raw. | country_id | No complete-national-inventory claim. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | J country/conventions/coverage metadata | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## geography

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | J.country | new-zealand. | country_id, geography_id | FK country. |
| geography_id | U.authority + U.district + existing bridge key | key(geo,[new-zealand, authority, district]); preserve first binding on display correction. | country_id, geography_id | 4 existing geography IDs, enumerated below. |
| name | U.authority + U.district | authority + " / " + district, bridge display form. | country_id, geography_id | Raw names retained; names not PK. |
| parent_geography_id | No supplied geography hierarchy | NULL. | country_id, geography_id | Do not infer board/ward/council parent. |
| effective_from_label | No supplied effective interval | NULL. | country_id, geography_id | No boundary date invented. |
| effective_to_label | No supplied effective interval | NULL. | country_id, geography_id | No vacancy-date boundary expiry. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id, geography_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id, geography_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | U authority/district and original U object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id, geography_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## office

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Existing observatory/package ID space | N=cdd-observatory-v1. | id_namespace, office_id | Stable across releases; collision across lineages fails, never overwrite. |
| office_id | U.id | Exact NZ race ID used as public office ID. | id_namespace, office_id | 4 offices; do not replace with authority slug or split by seats. |
| country_id | J.country | new-zealand. | id_namespace, office_id | FK country. |
| geography_id | Existing bridge geography binding for U | Use geography_id above. | id_namespace, office_id | FK same country. |
| name | U.district / U.office_type | district + " — " + office_type with underscores replaced by spaces. | id_namespace, office_id | Preserve supplied district spelling/diacritics. |
| office_type | U.office_type | Underscores→spaces, existing bridge form; raw code retained. | id_namespace, office_id | councillor/community board member are office types, not tier. |
| office_status | Included prospective race register | current. | id_namespace, office_id | Vacancy.current_holder NULL does not make office historical. |
| record_state | Explicit state instruction; otherwise source membership | active baseline, including historical tracked records. Only sourced override can withdraw/supersede. | id_namespace, office_id | Historical ≠ withdrawn. Omission in incomplete refresh ≠ deletion. |
| state_note | No explicit baseline withdrawal instruction | NULL; nonactive requires sourced reason. | id_namespace, office_id | Do not infer from age, absence or prior event annulment. |
| registry_qualified | Not supplied | NULL. | id_namespace, office_id | Do not infer from official notice or candidate roster. |
| next_date_id | U.election_date + U.date_precision | Own office/next date row, label exact election_date. | id_namespace, office_id | Four existing dates; components agree with next event. |
| next_date_resolution | U.election_date + date_precision | resolved for all four supplied day dates; unknown if later genuinely missing. | id_namespace, office_id | Expected certainty is not called; missing close time ≠ missing date. |
| next_history_key | Bridge key(next, U.id) | Exact next-* event ID, same as that event history_key. | id_namespace, office_id | FK corresponding prospective event; never historical latest date. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | U entire object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## office_tier_classification

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Office identity contract | N=cdd-observatory-v1. | id_namespace, office_id | Exact namespace of owning office. |
| office_id | T.classifications[].office_id | Exact existing ID; no new office generated. | id_namespace, office_id | Full set equality, including historical offices; effective union checked on incomplete refresh. |
| tier | Reviewed T.classifications[].tier | national→national_context; regional/municipal/other unchanged; unknown→NULL. | id_namespace, office_id | No automatic copy of legacy tier or council; calendar labels excluded. |
| review_status | Reviewed T status and row review flags | Known accepted row→approved; explicitly flagged known row→needs_review; unknown→unknown. | id_namespace, office_id | Never silently approve draft. Missing T fails whole lineage import. |
| rationale | T.classifications[].rationale | Nonempty verbatim rationale and evidence, no guessed classification. | id_namespace, office_id | Must address sourced office/geography, not cohort wording. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| classification_path | Required per-country tier path | schemas/atlas/tiers/<country_id>.json. | id_namespace, office_id | Exact retained_input FK. LatAm 21 office-bearing countries; NZ one; status-only countries need none. |
| classification_kind | Contract constant | tier_classification. | id_namespace, office_id | Exact composite kind/hash FK. |
| classification_sha256 | Accepted T bytes | SHA256 of actual file, not a placeholder or this map. | id_namespace, office_id | Must match retained descriptor; currently no accepted hash exists. |
| raw_json | T.classifications[] entire row | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## research_date

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| date_id | Owning record and date slot | date- + full SHA256(C([N, owner_type, owner_id, slot])); event/ballot, office/next; distinct claim owners for conflicts. | date_id; Identity Rules date binding | Stable internal identity; no date-derived new public event. |
| label | U.election_date or H.election_date; prospective event close-time fields | Office label=election_date. Prospective event label=date + space + supplied close_time_local + space + time_zone if time supplied; else date. Historical label=H.election_date. | date_id; Identity Rules date binding | Retain time/timezone raw; no UTC conversion or invented noon. |
| precision | U.date_precision; H.election_date grammar | All seven event dates day in actual package. Honor explicit month/year/unknown in later accepted inputs; no invented day. | date_id; Identity Rules date binding | U declares day; disagreement with components fails. |
| certainty | Existing bridge date contract | Prospective/office next=expected; historical=unknown. | date_id; Identity Rules date binding | No upgrade from indexed official notice to called. |
| year | Supplied ISO date component | Copy integer year only if present. | date_id; Identity Rules date binding | Full Gregorian validation; no snapshot year fallback. |
| month | Supplied ISO month component | Copy if present; absent→NULL. | date_id; Identity Rules date binding | Future year-only must remain month NULL. |
| day | Supplied ISO day component | Copy if present; absent→NULL. | date_id; Identity Rules date binding | All actual seven have day; no fabricated partial-date research example. |
| range_start_id | Explicit supplied range only | NULL baseline; later separate known endpoint with slot suffix /start. | date_id; Identity Rules date binding | Same-lineage FK, no cycle/unknown endpoint. |
| range_end_id | Explicit supplied range only | NULL baseline; later /end. | date_id; Identity Rules date binding | Ordered endpoint intervals; never merge separate elections into a range. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | date_id; Identity Rules date binding | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | date_id; Identity Rules date binding | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | U/H original date + declared precision/time fields | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | date_id; Identity Rules date binding | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## election_event

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Owning office | N. | id_namespace, office_id, history_key | Every child FK includes N, office_id and history_key. |
| office_id | Prospective U.id; historical H.related_race_id | Copy exact owning office. | id_namespace, office_id, history_key | Historical related_race_id must exist. |
| history_key | Prospective key(next, U.id); historical H.id | Preserve existing bridge keys. | id_namespace, office_id, history_key | No date-derived renaming. |
| event_id | Prospective key(next, U.id); historical H.id | Same existing public ID; seven IDs enumerated below. | id_namespace, office_id, history_key | 4 prospective+3 historical, not 11 candidate events. |
| date_id | Own ballot research_date | Own date row even for unknown label; NULL only for unresolved conflicting claims. | id_namespace, office_id, history_key | DDL requires date_id for resolved/unknown. |
| date_resolution | Date value and explicit conflict decision | known precision→resolved; unknown→unknown; competing unselected claims→conflicting with NULL pointer. | id_namespace, office_id, history_key | Certainty independent: resolved does not mean called/certified. |
| event_kind | U.election_type / H.election_type | by_election→special; ordinary→ordinary. | id_namespace, office_id, history_key | Actual baseline four special +three ordinary. |
| selected_history_role | U versus H collection | Prospective none; historical selected. | id_namespace, office_id, history_key | 4 none+3 selected; no other baseline events. |
| electoral_system | U/H.electoral_system | Copy FPP/STV. | id_namespace, office_id, history_key | STV stage reports missing stays a limitation. |
| comparability | U.notes / H.evidence_status | Copy verbatim. | id_namespace, office_id, history_key | Indexed notice and provisional mirror qualifiers retained. |
| ballot_basis | Prospective U.electoral_system; historical H.vote_unit | Bridge: prospective FPP→candidate_marks, STV→unknown; histories candidate_marks. | id_namespace, office_id, history_key | Never calculate unique voters/turnout or party shares from marks. |
| share_unit | Bridge/source contract | percent_0_100. | id_namespace, office_id, history_key | All actual historical share values uncollected. |
| legal_outcome | U/H evidence context | Prospective not_held; provisional_legacy_mirror→preliminary; other histories unknown. | id_namespace, office_id, history_key | Final table wording remains evidence; no invented certification proceeding. |
| record_state | Explicit sourced state instruction | active baseline; legalOutcome retained separately. | id_namespace, office_id, history_key | Annulled/superseded legal evidence remains addressable. |
| state_note | No withdrawal instruction supplied | NULL baseline; explicit reason on later state transition. | id_namespace, office_id, history_key | Never inferred from omitted row. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | U or H entire object, including candidates/results, declaration dates and metric gates | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## proceeding

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| office_id | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| history_key | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| proceeding_id | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| kind | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| sequence_no | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| supersedes_id | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| legal_outcome | No structured proceedings/IDs supplied | NO ROW. Retain declaration_date and final/preliminary notes in input/event raw; result attaches to event. | id_namespace, office_id, history_key, proceeding_id | Zero proceedings; no invented first round, STV stage or certification. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key, proceeding_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key, proceeding_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | No supplied row | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key, proceeding_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## result_row

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Owning event | N. | id_namespace, office_id, history_key, result_row_id | Wrong namespace fails. |
| office_id | Owning H.related_race_id | Exact race/office ID. | id_namespace, office_id, history_key, result_row_id | Never prospective candidate ID. |
| history_key | H.id | Exact historical key. | id_namespace, office_id, history_key, result_row_id | Historical event FK. |
| result_row_id | V=H.results[].id | Exact supplied NZ-...-Rnn ID. | id_namespace, office_id, history_key, result_row_id | 36 rows, no reindexing or name matching across years. |
| proceeding_id | No result-to-proceeding link supplied in either baseline | NULL; existing event.proceedingIds alone does not assign each result to a proceeding. | id_namespace, office_id, history_key, result_row_id | Do not pick first proceeding or create one. |
| country_id | J.country | new-zealand. | id_namespace, office_id, history_key, result_row_id | Same-country office FK. |
| candidate_or_list_label | V.name | Verbatim spelling/capitalization. | id_namespace, office_id, history_key, result_row_id | No identity linkage from name similarity. |
| original_party_label | V.affiliation | Copy supplied string; null→NULL. | id_namespace, office_id, history_key, result_row_id | Independent only where actually supplied. |
| original_party_code | No separate code; bridge partyCode=affiliation | Preserve nonnull affiliation token as legacy code alias; NULL when affiliation null, no empty-code invention. | id_namespace, office_id, history_key, result_row_id | Raw identifies label/code overloading; not standardized party identity. |
| party_namespace | Existing bridge namespace | new-zealand/ + exact H.id. | id_namespace, office_id, history_key, result_row_id | Election-scoped; no automatic cross-cycle grouping. |
| party_mapping_id | No supplied normalized concordance | NULL. | id_namespace, office_id, history_key, result_row_id | No inferred coalition/successor equivalence. |
| votes | V.votes | Copy nonnegative integer or NULL. | id_namespace, office_id, history_key, result_row_id | All36 actual values positive; multi-seat marks not voters. |
| votes_status | V.votes | NULL→unknown,0→zero, positive→recorded. | id_namespace, office_id, history_key, result_row_id | Do not create votes for11 prospective candidates. |
| share | V.vote_share | NULL in all 36 actual rows; otherwise copy explicitly supplied value. | id_namespace, office_id, history_key, result_row_id | Never derive from sum of candidate marks. |
| share_status | V.vote_share | unknown for null; zero/recorded only for supplied numeric value. | id_namespace, office_id, history_key, result_row_id | 36 unknown baseline. |
| share_unit | LatAm V.shareUnit / NZ explicit percentage convention | Copy LatAm; NZ percent_0_100 even when value unknown. | id_namespace, office_id, history_key, result_row_id | Range check in matching unit; never divide candidate marks into a new share. |
| seats | No per-candidate seat count in V | NULL. H.seats=6 is event context, not copied to each candidate. | id_namespace, office_id, history_key, result_row_id | No winner→1 computation. |
| seats_status | No per-candidate seats supplied | unknown. Legacy bridge not_applicable default retained in adapter provenance, not treated as sourced value. | id_namespace, office_id, history_key, result_row_id | Missing≠zero. |
| elected_flag | V.elected | true→1, false→0, null→NULL. | id_namespace, office_id, history_key, result_row_id | 18 elected across three six-member contests; not current officeholders. |
| is_substitute | Not supplied | NULL. | id_namespace, office_id, history_key, result_row_id | Do not copy fabricated bridge false. |
| evidence_status | H.evidence_status | provisional_legacy_mirror→preliminary; other supplied final tables→recorded. | id_namespace, office_id, history_key, result_row_id | 12 provisional rows; 24 other rows. No invented votes/metric clearance. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key, result_row_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key, result_row_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | V entire historical candidate object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key, result_row_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## party_mapping

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| party_namespace | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| mapping_id | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| source_context | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| election_context | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| original_label | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| original_code | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| mapped_group | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| uncertainty | No partyMappings rows / no NZ concordance | NO ROW. Retain original labels/codes in result_row and raw source arrays; do not manufacture a mapping. | country_id, party_namespace, mapping_id | Baseline zero. Raw volatility grouping is not authority to mint concordance rows. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id, party_namespace, mapping_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id, party_namespace, mapping_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | No supplied row | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id, party_namespace, mapping_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## source

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | J.country | new-zealand. | country_id, source_namespace, source_id | FK country. |
| source_namespace | Reserved source lineage | L. | country_id, source_namespace, source_id | Stable country-scoped source tuple (country_id, L, source_id). |
| source_id | S.id | new-zealand-- + exact NZ-Snn, existing bridge ID. | country_id, source_namespace, source_id | 12 distinct IDs; bare IDs preserved in crosswalk. |
| publisher | S.publisher | Verbatim, actually supplied. | country_id, source_namespace, source_id | No publisher derived from host. |
| title | S.title | Verbatim. | country_id, source_namespace, source_id | No URL-as-title fallback. |
| url | S.url | Exact supplied URL. | country_id, source_namespace, source_id | All12 https; do not assert successful full-page retrieval for indexed sources. |
| checked_as_of_label | S.checked_on | Verbatim2026-09-15 values as supplied. | country_id, source_namespace, source_id | Not election/declaration date. |
| evidence_grade | S.review_status | Copy review status verbatim. | country_id, source_namespace, source_id | Keep S.notes raw; provisional/indexed/page-reviewed distinctions survive. |
| file_sha256 | No cited-page bytes/hash supplied | NULL. | country_id, source_namespace, source_id | dataset.json hash is not source-page hash. |
| locator | No remote page locator supplied | NULL; occurrence pointers live in evidence_link. | country_id, source_namespace, source_id | Do not invent page/section. |
| data_rights | LatAm S.dataRights / no NZ rights grant | Copy supplied LatAm value; NZ unknown. | country_id, source_namespace, source_id | A public URL is not a rights grant. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id, source_namespace, source_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id, source_namespace, source_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | S entire source object including notes/review_status | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id, source_namespace, source_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## record_locator

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| record_key | Exact typed target tuple | rec- + SHA256(C([entity_kind,...PK components])); input uses [L, input_path], excluding R. | record_key | Full unhashed tuple collision check; internal key does not replace public ID. |
| entity_kind | Actual target table | country/geography/office/event/proceeding/result_row/party_mapping/source/input only. | record_key | No fake metric, poll, candidate, tier or artifact entity kind. |
| country_id | Target country | Required for every non-input target; input=NULL. | record_key | Must match real typed target country. |
| geography_id | Geography target only | Exact geography ID; NULL for other kinds. | record_key | FK country+geography. |
| id_namespace | Office/event/proceeding/result target | N only for these kinds; otherwise NULL. | record_key | Exact DDL target shape. |
| office_id | Office/event/proceeding/result target | Exact office ID; otherwise NULL. | record_key | Full namespaced FK, never bare office ID join. |
| history_key | Event/proceeding/result target | Exact existing HK; otherwise NULL. | record_key | FK same namespaced office/event. |
| proceeding_id | Proceeding target only | Exact Q.id for LatAm; otherwise NULL. | record_key | NULL even on a result locator; DDL shape has separate result target. |
| result_row_id | Result target only | Exact supplied result ID; otherwise NULL. | record_key | Full event+result FK. |
| party_namespace | Party-mapping target only | NULL baseline because no mapping rows. | record_key | Do not use a result party namespace as a mapping target. |
| party_mapping_id | Party-mapping target only | NULL baseline. | record_key | No invented party locator. |
| source_namespace | Source target only | L for source; otherwise NULL. | record_key | All source tuple components present together. |
| source_id | Source target only | Exact existing source ID or explicitly sourced inline ID; otherwise NULL. | record_key | Resolved source must exist. |
| input_path | Input target only | Exact retained logical path; otherwise NULL. | record_key | FK (L, R, path), even when many observation aliases target the same input. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | record_key | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | record_key | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| source_row_locator | Original file and JSON pointer / member | C(origin object), defined below, plus original raw row identity. | record_key | JSON pointer resolves against decoded input; byte hash identifies original compressed/container/member bytes. |

## evidence_link

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| evidence_id | Target, source and stable citation occurrence | ev- + SHA256(C([record_key, source tuple, occurrence, claim_kind])). | evidence_id | Exclude release/time/value; include claim_id for multiple independent claims. |
| record_key | Actual supported record / retained input | Use typed locator. Ancillary observations target their input locator with exact row pointer. | evidence_id | Dangling target is fatal, not unresolved evidence. |
| source_country_id | Source ownership | Exact source country, not necessarily country guessed from URL host. | evidence_id | Full source FK. |
| source_namespace | Resolved source lineage | L for references inside this lineage. | evidence_id | Do not steal citations from another selected release. |
| source_id | Supplied sourceIds / exact raw source resolver | Exact prefixed ID; NZ bare source_ids explicitly prefixed. | evidence_id | Known source missing from staging fails closed. |
| source_locator | Original reference occurrence | C(origin) with token, field/index and supplied remote page if present. | evidence_id | No invented PDF page/URL/retrieval date. |
| claim_kind | Purpose of reference | office/event/result/proceeding/date/screening/retained_observation/override as applicable. | evidence_id | Evidence scope retained; no assertion that all sources support all rows. |
| date_claim_id | Event/office dated claim only | Own or independent-claim research_date; otherwise NULL. | evidence_id | Separate conflicts retained; ancillary poll/control dates stay input JSON. |
| claim_json | Original cited record/field + explicit override if any | Lossless envelope with raw claim, origin, inherited-evidence status, override decision. | evidence_id | Never discard losing claim or clear a score gate. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | evidence_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | evidence_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |

## unresolved_evidence

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| unresolved_id | Unmatched original citation occurrence | unres- + SHA256(C([record_key, occurrence, original_token])). | unresolved_id | Deterministic, no fabricated source. |
| record_key | Real record/input containing token | Typed locator. | unresolved_id | Target FK remains mandatory. |
| original_token | Unmatched source-ID / citation field | Exact nonblank string. | unresolved_id | Not arbitrary prose, candidate name or party label. |
| source_locator | Original occurrence | C(origin), required. | unresolved_id | Original token recoverable at pointer. |
| reason | Resolution outcome | unmatched_catalogue_token / invalid_url / ambiguous_catalogue_match with details in raw. | unresolved_id | Never use unresolved as repair for accidentally missing known FK. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | unresolved_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | unresolved_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | Exact original unmatched occurrence | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | unresolved_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## identity_crosswalk

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| entity_kind | Canonical typed target | Same kind as locator; ancillary public IDs use input with original type retained raw. | entity_kind, upstream_namespace, upstream_id | No unsupported locator kind. |
| upstream_namespace | Identity Rules alias family | Stable source/country/type scope; never release hash. | entity_kind, upstream_namespace, upstream_id | Prevent ambiguity across source families. |
| upstream_id | Existing public/upstream ID or original artifact path | Copy verbatim; composite row binding uses C(tuple). | entity_kind, upstream_namespace, upstream_id | No silent retarget on refresh; ambiguous alias fails. |
| record_key | Canonical target locator | Exact key. | entity_kind, upstream_namespace, upstream_id | Composite FK enforces matching entity kind. |
| reason | Explicit identity transformation | preserved_public_id / preserved_history_key / retained_input_alias / legacy_briefing_path / source_prefix / documented_identity_binding. | entity_kind, upstream_namespace, upstream_id | No random surrogate; store alias before using it. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | entity_kind, upstream_namespace, upstream_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | entity_kind, upstream_namespace, upstream_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | Original alias tuple and input locator | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | entity_kind, upstream_namespace, upstream_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## publication_release

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| lineage_id | Current publication plus target lineage | Keep all existing keys; add/update only target L. | lineage_id | One selected release per lineage, all named cutover inputs required before cutover. |
| release_id | Validated candidate or unchanged selected release | R for target; every other lineage release unchanged. | lineage_id | FK immutable dataset_release. Never replace whole set with target-only list. |

## publication_receipt

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| singleton | Operational publication protocol | 1. | singleton | One physical swap receipt; not a research citation. |
| last_publish_attempt_id | Current durable ledger attempt | Exact attempt ID. | singleton | Logical cross-DB match; never used as public release. |
| attempted_lineage_id | Single target of this publication attempt | L. | singleton | Use serial per-lineage publication under unchanged single-receipt DDL. |
| attempted_release_id | Target selected R | R, including unchanged re-import. | singleton | FK to publication_release; receipt stored before swap. |

## ingest_attempt

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| attempt_id | Actual invocation | attempt- + lowercase UUIDv4; new every run. | attempt_id; fresh UUID only here | Only random ID; unique, distinct from release ID. |
| lineage_id | Requested lineage | Exact L. | attempt_id; fresh UUID only here | One target per attempt; serial multi-lineage coordinator, not a hidden global lineage. |
| operator | Authenticated operator/service | Actual nonempty identity. | attempt_id; fresh UUID only here | Do not invent operator metadata. |
| script_version | Actual future importer build | Real immutable build/version, not this document name. | attempt_id; fresh UUID only here | Operational; semantic adapter version separately hashed. |
| started_at | Operational UTC clock | Actual RFC3339 UTC instant. | attempt_id; fresh UUID only here | Commit started independently before staging. |
| finished_at | Terminal operation clock | NULL started; actual timestamp on succeeded/failed. | attempt_id; fresh UUID only here | Never used as research snapshot. |
| status | Publication state machine | started→succeeded after durable verified swap; started→failed before publication; reconcile ambiguous post-swap first. | attempt_id; fresh UUID only here | Terminal records immutable. |
| input_inventory_json | Preflight intended input paths/checksums/versions | Original immutable attempted inventory; absent files have null checksum + error, not fabricated hash. | attempt_id; fresh UUID only here | Reverify bytes after attempt commit; missing T/DDL/archive blocks import. |
| successful_release_id | Actual published target release | NULL started/failed; R succeeded. | attempt_id; fresh UUID only here | Reconcile logically against master receipt and full selected set. |
| publication_set_json | Verified publication_release pairs | NULL started/failed; canonical array of {lineage_id, release_id}, sorted lineage_id, on success. | attempt_id; fresh UUID only here | Includes Europe + any LatAm/NZ already present. |
| row_counts_json | Actual validation output | NULL before known; required recomputed object on success; partial failure diagnostics labelled partial. | attempt_id; fresh UUID only here | Selected/other/prospective and historical/candidate counts remain separate. |
| error_text | Actual error | NULL started/succeeded; nonempty failure details. | attempt_id; fresh UUID only here | Failure survives discarded staging; no success pointer. |

## schema_migration (master and ledger)

| Field | Source / conversion | Identity / assertion |
| --- | --- | --- |
| version | Respective unchanged migration inserts1 | PK1; PRAGMA user_version=1 in separate DBs |
| description | Exact migration literal, no research input | Master: `Atlas Phase 1 master draft`; ledger: `Atlas durable attempt ledger draft` |

## Prospective and historical event separation

There are four existing next-* event IDs and three supplied historical IDs, all enumerated in [Identity Rules](Continuity_Identity_Rules.md#new-zealand-office-geography-and-event-identities). U.candidates is a nomination roster, **not** a result vector or current-tenure list. Preserve all 11 candidate IDs and source_ids in J retained_input with input aliases. No result_row, elected_flag=false, seat=0 or officeholder assertion is created for them. Clutha/Wellington empty candidate arrays retain not_yet_imported/nominations_not_final status; they do not mean unopposed.

For histories, H.related_race_id binds the supplied historical event to the existing prospective office identity, exactly as the bridge. Do not rekey historical offices by historical year. Historical result V.id is explicit; similar names across years are not linked persons. H.seats=6 is retained event context; all three histories have six elected=true rows, but no per-candidate seat count is fabricated. Candidate marks cannot be summed into unique ballots or divided into party shares. H.ballot_total remains NULL.

## Dates and evidence traversal

U.election_date and date_precision supply day precision: Buller, Clutha, Porirua2026-10-16; Wellington2026-12-11. U.close_time_local is 12:00 for three and NULL for Clutha; timezone Pacific/Auckland is retained exactly. Office date label stays plain date; event label includes the existing bridge's supplied time/timezone suffix where present. No timestamp or UTC instant is inferred. H.declaration_date is a separate retained field, not the ballot date and not an invented proceeding. Two final tables remain distinguished from the 2022 provisional legacy mirror.

J.sources[] provide12 real source catalogue entries. U.source_ids link office and prospective event; U.candidates[].source_ids link retained nomination observations. H.source_ids link the historical event and are inherited by every V row as explicitly stated in J.conventions.source_inheritance. H results omit per-row source_ids by design; that is not an error. Missing any known NZ-Snn source is a fatal broken reference. Do not assign a publisher/title/checked date from an indexed notice's host; use the supplied S fields and keep S.review_status/S.notes.

Official indexed evidence pending full review remains pending in raw metadata; the package does not assert full retrieval/authentication of those notices. S.checked_on is a source check date; it is neither election close nor result declaration. Prospective evidence stays expected, not upgraded to called merely because the URL is official. With competing later sourced dates, retain separate claim dates/sources and withhold the single pointer with conflicting resolution, preserving event ID.

## Lossless retained content

Retain complete J, including coverage/conventions/research_window/release_status; races[].vacancy, current_holder=null, former_holder, cause, status; nominations/voting-document dates where supplied; voting_method, time_zone, seats_to_fill; all candidate roster statuses; histories[].declaration_date, informal_papers, blank_papers, ballot_total, seats, candidate_table_complete; source review notes; research_gaps; every metrics object and withholding reason. No missing field becomes zero or Independent.

Keep existing bridge candidate/issue/queue/metric IDs as aliases to J's input locator with exact row pointer. These are not newly typed observations under Prompt B. Bridge scoreGate=false is derived from raw withheld metrics; preserve supplied raw `metrics.status=withheld`, null competitiveness/Pedersen values and reasons. Do not manufacture a raw score_gate field or recompute metrics. No HTML briefing exists; preserve the lack of an original artifact while retaining the country/office/event data required for future compatibility pages.

## Publication coexistence and validation

NZ rows cite country-package-new-zealand's selected release. Europe-only or LatAm-only imports cannot retag them to the latest attempt/release. All four office IDs, seven event IDs,36 historical result IDs,11 candidate aliases and 12 source IDs must survive unrelated imports; evidence/retained input/alias pointers remain attached to NZ. No tier inferred from councillor/community_board_member; canonical tier file currently missing, so publication preflight fails until supplied/accepted.

The existing source-package validator passed. Field maps cover223 destination columns plus schema_migration. No NZ rows were loaded, no publication/rollback CI executed and no tier classification was invented. See [Prompt D](Prompt_D_Continuity_Checklist.md) for implementation gates. Europe remains default, status-only LatAm countries stay available, and no positive regional count is required.
