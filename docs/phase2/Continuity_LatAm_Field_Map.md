# Latin America → Atlas continuity field map

Phase 2 / cutover-gate documentation, 2026-09-16. Scope is the existing `latin-america-fe5e91689def` research lineage, not launch-vertical expansion. No frozen bytes, DDL, rows, importer or UI are changed.

## Governing-file availability

Main was freshly fetched and is still `5f46f9b03f24f4776ffb09feb390906b0ca75fdb` (PR #17 merge). The requested `schemas/atlas/migrations/0001_atlas_attempt_log.sql`, `0002_atlas_master.sql`, `docs/phase0/` and `docs/phase1/` files **are absent on this main**. This map uses the previously delivered, unchanged Prompt B files `001_atlas_attempt_log.sql` (SHA-256 e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1) and `001_atlas_master.sql` (1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da), plus the saved Prompt B rationale, all four Albania Prompt C documents, and Phase 0 continuity-counts.json / Election_Atlas_Phase0_Report.md. It does not claim the requested renumbered migrations were read from git. Before implementation, land/verify the stated unchanged contract at the requested paths; reject a materially different schema pending an explicit mapping revision. Albania is not reopened or edited.

**Known import blocker beyond missing tier/migration files:**67 real Mexico result rows carry share.value>100 with shareUnit=percent_0_100. The unchanged DDL rejects them. See [exact affected rows](#share-domain-compatibility-blocker). No clamp, scale, raw-field substitution, NULL coercion or row drop is authorized here. A reviewed documented override must resolve these before this lineage can publish.

## Verified baseline and source paths

`L=latin-america-fe5e91689def` exactly. The 127,077,676-byte recovered `Latin_America_Races_and_Briefings.zip` SHA-256 is `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f`. Every one of 18,767 original file members was checked against manifest.inventory path/hash/bytes; 21 country shards, 21 briefing shards, base and legacy-links hashes match. All 96 object files match the digest of their decompressed original bytes. Original archive exists in the recovered handoff; no artifact-host deployment is asserted.

**Count correction:** Phase 0 called 40,509 “selected histories.” In the actual normalized input it is **36,750 selected + 3,759 other** histories. Preserve those roles; add 18,149 none/prospective events for **58,658 total**. Do not drop other or prospective IDs to force the mislabeled subtotal.

| Verified input measure | Count |
| --- | ---: |
| Current / historical offices | 18,229 / 414 |
| All office IDs | 18,643 |
| Countries / territories | 36 (21 office-bearing +15 status-only) |
| Geographic records | 14,560 |
| All events | 58,658 |
| Selected / other / prospective | 36,750 /3,759 /18,149 |
| Detailed result rows | 269,740 |
| Existing proceedings | 13,697 |
| Normalized party mappings | 0 |
| Existing normalized sources | 12,254 |
| Explicit status-screen URL additions | 26 |
| Mapped source identities under this policy | 12,280 |
| Original briefings / cleaned briefing entries | 18,643 /18,643 |
| Metrics retained only | 74,572 |
| Officeholder / register / poll observations retained only | 64,641 /1,292 /28 |
| Issue / completion records retained only | 702 /12,738 |
| Artifact descriptors / tracked derivative files | 125 /141 |

Source additions are the 23 actual `base.countries[].extensions.raw.screen.sources[]` URL records plus three territory `.extensions.raw.source` URLs. They are not new research. Existing source IDs are never merged merely for equal URLs.

| Alias | Exact source path and JSON location |
| --- | --- |
| M | data/research/manifest.json |
| B0 | data/research/base.json.gz, decoded whole object |
| D_c | data/research/ + each M.countryFiles[].path; 21 manifest-listed decoded country objects |
| C/G/O/E/Q/S | B0 or D_c `/countries/i`, `/geographies/i`, `/offices/i`, `/events/i`, `/proceedings/i`, `/sources/i` |
| V | E `/resultRows/j`; raw original party row at `/extensions/raw` |
| A | B0 `/artifacts/i` |
| BF_c | data/research/ + M.briefingFiles[].path; decoded map Office ID → sanitized HTML |
| LL | data/research/legacy-links.json; original archive briefing path → Office ID |
| Z(entry) | Original zip member named exactly by M.inventory[].path; retained at archive/L/<entry> |
| Original country document | Z(Data/<country official name with spaces replaced by underscores>.json), explicitly checked per D_c; `/offices`, `/histories`, `/sources`, `/rosters` |
| Original text object | data/research/objects/<member sha256>.gz, when present; decoded bytes equal Z(member) |
| T | schemas/atlas/tiers/<country_id>.json for each of 21 office-bearing countries; all absent |

The manifest owns shard membership; do not glob in Europe/NZ. Read B0 once, each country shard once; ignore duplicated `.release` as row collections. Original Data/*.json and decoded objects reconcile/supply raw evidence but **do not become a second office/event/result load**. Histories `_key` match existing E.historyKey; all IDs come from committed derivatives. Original briefing bytes differ from sanitized BF strings; preserve and hash both representations, never claim sanitized text has original-byte SHA.

Key committed SHA-256s: manifest `010001d254827c882f028c4e118fa322ddaa0ef75f32aead9886a634e43f21e1`; base `7920209e27dbe40397bd1de50a93534a4a9ebe4e4de625de4e160c9ac1d189ed`; legacy-links `bc07c833a2479d1f445c941dc2a1945093a141210631669cee7e3c42571a55e9`.

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
| research_snapshot_label | M.release.snapshotLabel | Copy 2026-09-13; retrievalRangeLabel retained raw. | lineage_id, release_id | Do not replace with import date or max source date. |
| upstream_release_id | LatAm M.release.id / NZ packageRelease().id | Exact reserved legacy ID, equal to L. | lineage_id, release_id | Preserve original citation alias; pinned alias binding in raw_json, not latest attempt. |
| validated_counts_json | Recomputed inputs | Counts object per baseline, with selected/other/none separate. | lineage_id, release_id | Never label LatAm 40,509 as strictly selected; do not count NZ candidates as results. |
| research_coverage_complete | LatAm release.researchCoverageComplete / NZ coverage | false→0. | lineage_id, release_id | Software validation is not research completeness. |
| raw_json | M whole object + first-import alias binding | Lossless manifest plus operational legacy_alias_binding only on first Atlas adoption. | lineage_id, release_id | Preserve legacyDefects, original provenance/version, counts caveat, source inventory. |

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
| country_id | C.id in base + 21 shards | Exact slug. | country_id | 36 unique: 21 office-bearing +15 status-only. |
| country_code | No normalized country_code supplied | NULL; do not infer ISO from office prefix. | country_id | Nullable unique column; no fabricated country codes. |
| name | C.names.official | Verbatim. | country_id | Aliases/short name retained raw. |
| polity_kind | C.kind | Copy sovereign_country or territory. | country_id | 33 sovereign +3 territory; no status-only dummy offices. |
| region_id | C.regionId | Copy exact supplied region string. | country_id | Do not apply legacy regions[].isDefaultLanding to Atlas configuration. |
| coverage_status | C.coverageStatus | Copy partial / screened_out. | country_id | 24 partial,12 screened_out; partial territory may have zero offices. |
| screening_as_of_label | C.screening.asOfLabel | Copy when supplied; else NULL. | country_id | Not defaulted from import clock. |
| notes | C.notes | Verbatim; blank→NULL with original raw retained. | country_id | Preserve scope/qualification; zero imported offices ≠ no elections ever. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | C entire object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## geography

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| country_id | G.countryId | Copy exact. | country_id, geography_id | FK C.id. |
| geography_id | G.id | Copy existing ID, never regenerate from names. | country_id, geography_id | 14,560 supplied geographic units; stable on corrections. |
| name | G.names.official | Verbatim. | country_id, geography_id | Source codes/aliases remain raw. |
| parent_geography_id | G.parentId | Copy or NULL; no inferred hierarchy. | country_id, geography_id | Same-country parent FK; reject cycles. |
| effective_from_label | G.effective.fromLabel if supplied | NULL baseline (not supplied). | country_id, geography_id | No reform effective date invented. |
| effective_to_label | G.effective.toLabel if supplied | NULL baseline (not supplied). | country_id, geography_id | No expiry inferred from historical office status. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id, geography_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id, geography_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | G entire object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id, geography_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## office

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Existing observatory/package ID space | N=cdd-observatory-v1. | id_namespace, office_id | Stable across releases; collision across lineages fails, never overwrite. |
| office_id | O.id | Exact public ID. | id_namespace, office_id | 18,643 IDs; 18229 current+414 historical. |
| country_id | O.countryId | Copy exact. | id_namespace, office_id | FK country; ownership remains L. |
| geography_id | O.geographyId | Copy exact G.id. | id_namespace, office_id | FK same country; no display-name join. |
| name | O.names.official | Verbatim. | id_namespace, office_id | Keep short display form in raw. |
| office_type | O.officeType | Verbatim, separate from geographic tier. | id_namespace, office_id | Do not reclassify using legacy tier text. |
| office_status | O.status | Copy current/historical. | id_namespace, office_id | Current ≠ present officeholder tenure. |
| record_state | Explicit state instruction; otherwise source membership | active baseline, including historical tracked records. Only sourced override can withdraw/supersede. | id_namespace, office_id | Historical ≠ withdrawn. Omission in incomplete refresh ≠ deletion. |
| state_note | No explicit baseline withdrawal instruction | NULL; nonactive requires sourced reason. | id_namespace, office_id | Do not infer from age, absence or prior event annulment. |
| registry_qualified | O.registryQualified | true→1, false→0, null→NULL. | id_namespace, office_id | Preserve bridge assertion and underlying registry_status raw; no fresh qualification inference. |
| next_date_id | O.nextElection.date | Own office/next date row when nextElection exists; else NULL. | id_namespace, office_id | 18,149 next records; component/date equality against referenced event, labels may differ. |
| next_date_resolution | O.nextElection.date.precision | known→resolved; absent/unknown→unknown; documented conflict→conflicting. | id_namespace, office_id | Do not drop a prospective event merely for unknown precision. |
| next_history_key | O.nextElection.eventId → E.id | Look up actual event, copy its historyKey; NULL absent. | id_namespace, office_id | Event belongs to same N+office; never derive from year or chronological maximum. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | O entire object + original Data/<country>.json office | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

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
| label | E.date.label / O.nextElection.date.label | Copy exactly, including qualification text. | date_id; Identity Rules date binding | Do not parse extra day from narrative on this continuity pass. |
| precision | Same supplied date.precision | Copy year/month/day/unknown; no baseline ranges. | date_id; Identity Rules date binding | 12,127 year,440 month,46,076 day,15 unknown across events. |
| certainty | Same supplied date.certainty | Copy expected/called/conditional/unknown. | date_id; Identity Rules date binding | No official-URL→called conversion. |
| year | Same date.year | Copy known component; absent→NULL. | date_id; Identity Rules date binding | Integer1..9999; unknown has no components. |
| month | Same date.month | Copy only if supplied; else NULL. | date_id; Identity Rules date binding | Month/year retain missing day/month. |
| day | Same date.day | Copy only if supplied; else NULL. | date_id; Identity Rules date binding | Gregorian validity; no day 1 fallback. |
| range_start_id | Explicit supplied range only | NULL baseline; later separate known endpoint with slot suffix /start. | date_id; Identity Rules date binding | Same-lineage FK, no cycle/unknown endpoint. |
| range_end_id | Explicit supplied range only | NULL baseline; later /end. | date_id; Identity Rules date binding | Ordered endpoint intervals; never merge separate elections into a range. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | date_id; Identity Rules date binding | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | date_id; Identity Rules date binding | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | E.date / O.nextElection.date original object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | date_id; Identity Rules date binding | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## election_event

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Owning office | N. | id_namespace, office_id, history_key | Every child FK includes N, office_id and history_key. |
| office_id | E.officeId | Copy. | id_namespace, office_id, history_key | FK existing office including historical. |
| history_key | E.historyKey; raw histories[]._key reconciliation | Copy verbatim opaque string. | id_namespace, office_id, history_key | Do not split/rebuild pipe-bearing keys; preserve qualifiers and ordinal suffix. |
| event_id | E.id | Copy public ID including next-* and event-*. | id_namespace, office_id, history_key | 58,658 unique; no filtering to selected histories. |
| date_id | Own ballot research_date | Own date row even for unknown label; NULL only for unresolved conflicting claims. | id_namespace, office_id, history_key | DDL requires date_id for resolved/unknown. |
| date_resolution | Date value and explicit conflict decision | known precision→resolved; unknown→unknown; competing unselected claims→conflicting with NULL pointer. | id_namespace, office_id, history_key | Certainty independent: resolved does not mean called/certified. |
| event_kind | E.kind | Copy supplied normalized enum. | id_namespace, office_id, history_key | No fresh keyword inference from round or office type. |
| selected_history_role | E.selectedHistoryRole | Copy: selected 36,750; other3,759; none18,149. | id_namespace, office_id, history_key | 40,509 is selected+other historical rows, not strictly selected. |
| electoral_system | E.electoralSystem | Preserve existing supplied string; raw identifies legacy projection, including See source briefing/basis wording. | id_namespace, office_id, history_key | Do not claim a newly researched electoral system or infer PR/FPTP. |
| comparability | E.comparability | Verbatim. | id_namespace, office_id, history_key | Predecessor, provisional and excluded-series context survives. |
| ballot_basis | E.ballotBasis | Copy explicit normalized enum; original basis remains raw. | id_namespace, office_id, history_key | No fresh denominator calculation; candidate marks ≠ unique voters. |
| share_unit | E.voteShareUnit | Copy percent_0_100 baseline. | id_namespace, office_id, history_key | Match result units. |
| legal_outcome | E.legalOutcome | Copy existing enum including annulled/superseded/preliminary/certified. | id_namespace, office_id, history_key | 7 annulled+4 superseded retained; no new legal inference or exclusion of ID. |
| record_state | Explicit sourced state instruction | active baseline; legalOutcome retained separately. | id_namespace, office_id, history_key | Annulled/superseded legal evidence remains addressable. |
| state_note | No withdrawal instruction supplied | NULL baseline; explicit reason on later state transition. | id_namespace, office_id, history_key | Never inferred from omitted row. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | E entire object, including extensions.raw and retained result array | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## proceeding

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Q.eventId → E | N. | id_namespace, office_id, history_key, proceeding_id | Resolve exactly one event. |
| office_id | Resolved E.officeId | Copy. | id_namespace, office_id, history_key, proceeding_id | Full event FK. |
| history_key | Resolved E.historyKey | Copy. | id_namespace, office_id, history_key, proceeding_id | Full event FK. |
| proceeding_id | Q.id | Copy existing supplied projection ID. | id_namespace, office_id, history_key, proceeding_id | 13,697 existing IDs; generate none from additional raw narrative. |
| kind | Q.kind | Copy supplied normalized kind, preserving legacy projection provenance/notes. | id_namespace, office_id, history_key, proceeding_id | 13,608 first_round,82 runoff,1 recount,6 annulment. Not a new certification of bridge heuristics. |
| sequence_no | Q.round | Copy numeric positive integer; NULL for absent. | id_namespace, office_id, history_key, proceeding_id | 32 numeric1,13,665 NULL; do not parse sequence from labels. |
| supersedes_id | Q.supersedesId | Copy or NULL (all NULL baseline). | id_namespace, office_id, history_key, proceeding_id | Same namespaced event; reject cycles; supersededById retained raw/inverse-checked. |
| legal_outcome | Q.legalOutcome | Copy supplied enum. | id_namespace, office_id, history_key, proceeding_id | Do not strengthen to certified from an official-looking source. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key, proceeding_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key, proceeding_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | Q entire object + parent event original round/kind evidence | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key, proceeding_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

## result_row

| Destination field | Source path / field | Conversion / null policy | Deterministic identity | Evidence / FK / validation |
| --- | --- | --- | --- | --- |
| id_namespace | Owning event | N. | id_namespace, office_id, history_key, result_row_id | Wrong namespace fails. |
| office_id | Owning E.officeId | Copy. | id_namespace, office_id, history_key, result_row_id | Same event/office as result. |
| history_key | Owning E.historyKey | Copy. | id_namespace, office_id, history_key, result_row_id | No joining results by display candidate name. |
| result_row_id | V.id | Copy existing -r index ID; do not recompute rank/index on refresh. | id_namespace, office_id, history_key, result_row_id | 269,740 unique IDs; original binding immutable. |
| proceeding_id | No result-to-proceeding link supplied in either baseline | NULL; existing event.proceedingIds alone does not assign each result to a proceeding. | id_namespace, office_id, history_key, result_row_id | Do not pick first proceeding or create one. |
| country_id | E.countryId | Copy. | id_namespace, office_id, history_key, result_row_id | FK same country office. |
| candidate_or_list_label | V.label; V.candidate retained separately raw | Copy supplied label; legacy Unlabelled source row, if encountered, becomes NULL with raw sentinel retained. | id_namespace, office_id, history_key, result_row_id | No candidate invented from party code. |
| original_party_label | V.extensions.raw.party, then party_label; never fallback candidate | Copy first explicitly supplied nonblank party label; else NULL. | id_namespace, office_id, history_key, result_row_id | Candidate and party remain distinguishable; unknown not Independent. |
| original_party_code | V.partyCode | Exact token; blank→NULL with raw blank preserved. | id_namespace, office_id, history_key, result_row_id | Scope by original partyNamespace; no successor equivalence. |
| party_namespace | V.partyNamespace | Copy full existing country/source/year token. | id_namespace, office_id, history_key, result_row_id | No standardization or stripping source segment. |
| party_mapping_id | No supplied normalized concordance | NULL. | id_namespace, office_id, history_key, result_row_id | No inferred coalition/successor equivalence. |
| votes | V.votes.value | Copy integer or NULL. | id_namespace, office_id, history_key, result_row_id | 233259 positive,35995 zero,486 unknown; no noninteger counts observed. |
| votes_status | V.votes.status | Copy exactly. | id_namespace, office_id, history_key, result_row_id | Value/status consistency; missing ≠ zero. |
| share | V.share.value | Copy finite binary64 numeric value or NULL, no rounding; any out-of-domain supplied value fails target import until a documented override selects a supported correction or explicit withholding. | id_namespace, office_id, history_key, result_row_id | 0..100 in source unit; 67 actual Mexico rows violate this. Preserve raw claims, reject projection; see compatibility-blocker table. |
| share_status | V.share.status | Copy exactly. | id_namespace, office_id, history_key, result_row_id | 233136 recorded,35627 zero,977 unknown. |
| share_unit | LatAm V.shareUnit / NZ explicit percentage convention | Copy LatAm; NZ percent_0_100 even when value unknown. | id_namespace, office_id, history_key, result_row_id | Range check in matching unit; never divide candidate marks into a new share. |
| seats | V.seats.value | Copy integer or NULL. | id_namespace, office_id, history_key, result_row_id | 39526 positive,50239 zero,179975 unknown. |
| seats_status | V.seats.status | Copy exactly. | id_namespace, office_id, history_key, result_row_id | No winner→one-seat inference. |
| elected_flag | V.electedFlag | true→1, false→0, null→NULL. | id_namespace, office_id, history_key, result_row_id | Election result only, not current tenure. |
| is_substitute | V.extensions.raw.substitute; legacy V.isSubstitute retained raw | Only explicit boolean true/false→1/0; absence→NULL. | id_namespace, office_id, history_key, result_row_id | Bridge default false is not a source assertion; no substitute inferred. |
| evidence_status | V.evidenceStatus | Copy existing value. | id_namespace, office_id, history_key, result_row_id | Numeric status and source certainty remain independent. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | id_namespace, office_id, history_key, result_row_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | id_namespace, office_id, history_key, result_row_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | V entire object, including extensions.raw | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | id_namespace, office_id, history_key, result_row_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

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
| country_id | Country owning S; source-ID prefix checked against actual C ids | Copy owning country. Base poll sources resolve their exact chile/venezuela prefix. | country_id, source_namespace, source_id | 12,254 supplied sources; never infer from URL host or publisher boilerplate. |
| source_namespace | Reserved source lineage | L. | country_id, source_namespace, source_id | Stable country-scoped source tuple (country_id, L, source_id). |
| source_id | S.id; status-screen inline URLs | Preserve all 12,254 existing IDs. Add 26 genuinely supplied status-screen URLs with country--key(url, URL); no URL-based merging of legacy IDs. | country_id, source_namespace, source_id | 12,280 mapped source identities after documented screen additions; aliases preserved. |
| publisher | Original raw catalogue source has no publisher field; screen sources none | NULL. Keep legacy S.publisher country boilerplate in raw, not as researched publisher. | country_id, source_namespace, source_id | No country/grade/domain fabricated publisher. |
| title | Raw matching catalogue .title; status screen.sources[].title | Copy sourced title if supplied; URL-only/poll-generated legacy fallback without actual title→NULL, retain legacy display title raw. | country_id, source_namespace, source_id | Join catalogue by exact original ID; preserve conflicting raw metadata without guessing. |
| url | S.url; status screen.sources[].url / territory raw.source | Copy exact supplied URL. | country_id, source_namespace, source_id | All 12,254 legacy sources have URL; no fetch/availability claim. |
| checked_as_of_label | S.datesLabel (derived from raw retrieved/accessed) | Copy nonblank; else NULL. Screen source_date is publication label, not check date. | country_id, source_namespace, source_id | No snapshot-date default. |
| evidence_grade | Raw exact catalogue grade, then quality, then type; screen.source_type | Copy explicit value with source key retained raw; absent→NULL. | country_id, source_namespace, source_id | Not publisher/legal_outcome. |
| file_sha256 | S.fileHash / supplied raw sha256 | Copy valid 64-hex value or NULL; retain original string raw. | country_id, source_namespace, source_id | Hash belongs to cited source file, not normalized shard. |
| locator | S.locator / supplied raw page or source_pages | Copy nonblank supplied locator; else NULL. | country_id, source_namespace, source_id | Do not fabricate PDF page from table index. |
| data_rights | LatAm S.dataRights / no NZ rights grant | Copy supplied LatAm value; NZ unknown. | country_id, source_namespace, source_id | A public URL is not a rights grant. |
| lineage_id | Owning lineage input | Exact L for this row; no latest-import default. | country_id, source_namespace, source_id | FK to selected lineage/release for active projection; dataset_release references dataset_lineage. Empty baseline tables: NO ROW. |
| release_id | Validated lineage fingerprint / existing identical release | Own R; unchanged unrelated lineage never repointed. | country_id, source_namespace, source_id | Active projection FK selected (L, R); dataset_release PK immutable. Empty tables: NO ROW. |
| raw_json | S whole object + exact raw catalogue match / screen source object | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | country_id, source_namespace, source_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

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
| raw_json | Original alias tuple and its input locator | Lossless raw envelope; do not rewrite original values. Empty proceeding/party_mapping: NO ROW. | entity_kind, upstream_namespace, upstream_id | Original pointer/hash recoverable; preserve nonprojected fields and prior origin on carry-forward. |

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

## Evidence traversal and source provenance

Typed evidence projection is explicit: O.sourceIds→office; E.sourceIds→event and its date claim; Q has no sourceIds, so its inherited E.sourceIds links carry `inherited_from_event` in claim_json, without claiming a separately recovered certificate. V has no normalized sourceIds: inherit E.sourceIds for the result claim while retaining V.extensions.raw and any original raw direct-reference fields losslessly. A supplied event proceeding list is not a result-to-proceeding assignment. Additional opaque raw citations remain retained JSON, not automatically promoted by keyword scanning.

For ancillary polls/registers/officeholder/issue arrays, supplied sourceIds target the owning retained-input locator, with exact array pointer and original observation ID in claim_json; do not assert current tenure or local inference. Source.supportedRecordIds is provenance to reconcile against known real targets; do not fabricate a target when it is unknown, and do not treat every catalogue source's country attachment as evidence for every office. Catalogues, original source requests, raw source IDs and unsupported metadata stay available through the SQLite retained payload.

Status-only country screening:23 screen.sources[] URLs plus 3 territory source URLs get genuine source/evidence rows as described. `screen.source_date` remains publication/context metadata in raw; it is not checked_as_of_label. Nicaragua has no supplied screen object in the base record: preserve coverage notes, do not manufacture a source or an office.

All currently projected normalized source IDs have corresponding S records. Missing known source after staging is a broken FK and must fail. A future truly unmatched token is explicit unresolved_evidence. Refer to Identity Rules for exact source metadata matching, the Argentina duplicate title alias, and the projection boundary. No source page is fetched or its current availability asserted by this map.

## Existing proceedings and legal status

The 13,697 Q rows are already-present bridge projections, not13,697 newly discovered legal proceedings. Copy their IDs, event bindings, kind/legalOutcome and full notes; raw parent history round/event_kind explains the bridge's classification, including defaults. Retention of kind=first_round is continuity of the supplied legacy projection, not independent verification that a legal round occurred. Do not create any additional proceeding from raw recount/annulment/certification words or rerun a broader heuristic. In particular, no new certification status or supersession edge is inferred. Preserve all 6 existing annulment proceedings and 1 recount, alongside events that have no proceeding. A future sourced correction uses a documented override with the old ID preserved.

Example already supplied: `proceeding-c1c35cc6162d072ce71d73af` attaches to `event-467872c8fb089f392cd4a5dc`, office `SV-OLD-12-1`, HK `SV-OLD-12-1|SV-OLD-12-1-2018-repeat||524`, kind=recount, legal_outcome=unknown. Its raw certification/recount dates survive even though no new typed certification is minted. This event is role=other on a historical/predecessor office; continuity must not discard it.

## Ancillary data and original briefings

Retain whole B0/D_c objects and original archive members. Metrics(74,572), scoreGate values, inputs/eligibility/withholding, officeholder observations(64,641), electoral registers(1,292), polls(28), issues(702), completionQueue(12,738), region metadata and artifacts(125) stay lossless in retained_input. Preserve their existing IDs as input crosswalk aliases with exact JSON pointers. No new metric computation/table; a provisional numeric value with scoreGate=false remains gated, not cleared by successful import.

`legacy-links.json` maps18,643 exact original briefing paths one-to-one to office IDs. Verify all referenced archive member hashes and the office ID inside original HTML; retain inert original bytes plus cleaned BF_c JSON map separately. Raw original artifact aliases resolve to archive/member retained_input by hash; cleaned derivative lookup uses BF_c key. Do not execute HTML/scripts or resanitize frozen bytes. Original binaries declared unavailable by legacy artifact metadata remain marked with that original state; this audit recovered the full archive, so a future importer can verify byte recovery without claiming a deployed public artifact host.

All125 artifact descriptors have a retained ZIP/member target under this inventory. Original raw Data/*.json, source objects and sanitized shards are not additional records to sum into counts. The old Build_Status briefing count18,528 and release_summary totals are documented legacy defects; recomputed18,643 office/briefing entries govern.

## Status-only country continuity

The 15 base entries are barbados, bolivia, chile, grenada, honduras, nicaragua, panama, saint-lucia, saint-vincent-and-the-grenadines, suriname, uruguay, venezuela, french-guiana, falkland-islands-islas-malvinas, south-georgia-and-the-south-sandwich-islands. Each has zero imported offices/events. Copy existing country kind/status/notes/screening and preserve its page/citation identity. Twelve are screened_out sovereign records; the three territories are partial. Do not turn partial into a zero-percent coverage claim or load territorial supplement offices that are not present in the current derivative identity set. Original supplementary research remains retained evidence.

## Publication coexistence and validation

Every row's lineage_id remains latin-america-fe5e91689def. Its release_id is the LatAm member selected by publication_release, not publication_receipt.attempted_release_id. A Europe-only import copies LatAm active rows/release metadata/evidence/raw inputs unchanged and changes only Europe's selected member and operational receipt. The read-only citation join and exact alias pinning are in [Identity Rules](Continuity_Identity_Rules.md#legacy-release-alias-and-current-citation-rules).

The map covers223 destination columns plus schema_migration. Checks actually performed here are archive/member, compressed shard and object hashes; baseline counts/ID uniqueness; source/normalized shape inspection; and document coverage/link checks. The value-shape check found 67 percentage-domain violations (all Mexico); all checked namespaced-reference and other numeric/date-shape checks passed. No SQLite research rows were inserted, no importer/publication tests executed, no actual tier classification approved. Use [Prompt D](Prompt_D_Continuity_Checklist.md) for remaining implementation/CI gates.

## Share-domain compatibility blocker

**Observed, not hypothetical:**67 rows in `data/research/countries/mexico.json.gz` have V.share.status=recorded, V.shareUnit=percent_0_100 and V.share.value>100. They fail Prompt B result_row's upper-bound CHECK. Existing release validation metadata is not proof of compatibility with the Atlas DDL. All other checked reference/value/date shapes passed the read-only continuity check. This task leaves both frozen bytes and DDL unchanged.

Fail-closed rule: preflight report every affected full event/result key and source locator, commit a failed attempt without a successful release pointer, retain last-good publication. Do not clamp to100, divide by100, change units, choose a different denominator, drop these67 results, or silently replace the supplied number withNULL. Those would change research semantics without the required documented override. Copying an out-of-domain number into raw_json does not make it valid in the typed share column.

Required resolution before successful LatAm ingest: a reviewed file at `data/overrides/atlas/latin-america-fe5e91689def/share-domain.json` (currently absent) must name each affected full PK, expected_original, precise normalized/original source locator and supported decision. It may select an actually supported existing alternate value **only with its basis explained**, or explicitly withhold typed share=NULL/unknown while preserving the original value, status, unit and conflicting claim in retained input/evidence. A withholding decision must atomically address share and share_status; all other votes/seats/IDs remain unchanged. No such override is authored or approved by these docs. Hash the accepted override and retain it; a corrected projection has a new release while the legacy citation alias remains pinned.

The raw party objects often also contain a different `.share` alongside `.reported_share`. For the first affected row raw.share=57.96064959400375 while normalized/report value=382.2657055 and votes=18559. Neither this numerical plausibility nor its presence permits an automatic replacement: source denominators/segments and the frozen normalization precedence (`reported_share ?? share`) require explicit review. This table is an exception inventory, not a correction table.

All pointers below are into the **decoded** Mexico shard. Owning event contains historyKey, officeId, sourceIds and original source evidence; exact full PK is `(cdd-observatory-v1, office_id, history_key, result_row_id)`. Table values are original normalized shares. No new values are supplied.

| Result row ID | Office ID | Original history key | JSON pointer | Supplied share (percent_0_100) |
| --- | --- | --- | --- | --- |
| event-c53481f1c2af40473903c6dd-r0 | MX-M-14-8 | MX-M-14-8\|mx_returns_AYUN_14_8_2018\|\|1166 | /events/3018/resultRows/0 | 382.2657055 |
| event-c53481f1c2af40473903c6dd-r1 | MX-M-14-8 | MX-M-14-8\|mx_returns_AYUN_14_8_2018\|\|1166 | /events/3018/resultRows/1 | 199.6498455 |
| event-298a2c0f453cc4423e10d6d9-r0 | MX-M-14-13 | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 | /events/3022/resultRows/0 | 289.5065398 |
| event-298a2c0f453cc4423e10d6d9-r1 | MX-M-14-13 | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 | /events/3022/resultRows/1 | 116.587396 |
| event-298a2c0f453cc4423e10d6d9-r2 | MX-M-14-13 | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 | /events/3022/resultRows/2 | 114.4768133 |
| event-298a2c0f453cc4423e10d6d9-r3 | MX-M-14-13 | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 | /events/3022/resultRows/3 | 111.3852556 |
| event-92c88013e1707162383365c7-r0 | MX-M-14-16 | MX-M-14-16\|mx_returns_AYUN_14_16_2018\|\|1173 | /events/3025/resultRows/0 | 142.9072572 |
| event-92c88013e1707162383365c7-r1 | MX-M-14-16 | MX-M-14-16\|mx_returns_AYUN_14_16_2018\|\|1173 | /events/3025/resultRows/1 | 142.688007 |
| event-19049da36d1907576d30cabb-r0 | MX-M-14-21 | MX-M-14-21\|mx_returns_AYUN_14_21_2018\|\|1178 | /events/3030/resultRows/0 | 217.0100059 |
| event-19049da36d1907576d30cabb-r1 | MX-M-14-21 | MX-M-14-21\|mx_returns_AYUN_14_21_2018\|\|1178 | /events/3030/resultRows/1 | 131.8422602 |
| event-918b4b717c7d879be7f0775d-r0 | MX-M-14-31 | MX-M-14-31\|mx_returns_AYUN_14_31_2018\|\|1179 | /events/3031/resultRows/0 | 107.6303318 |
| event-918b4b717c7d879be7f0775d-r1 | MX-M-14-31 | MX-M-14-31\|mx_returns_AYUN_14_31_2018\|\|1179 | /events/3031/resultRows/1 | 106.8878357 |
| event-b0cbd05b4a1ac790c5a8e655-r0 | MX-M-14-28 | MX-M-14-28\|mx_returns_AYUN_14_28_2018\|\|1186 | /events/3038/resultRows/0 | 125.2457175 |
| event-b0cbd05b4a1ac790c5a8e655-r1 | MX-M-14-28 | MX-M-14-28\|mx_returns_AYUN_14_28_2018\|\|1186 | /events/3038/resultRows/1 | 110.5026678 |
| event-64a407db171425962b4ef38f-r0 | MX-M-14-30 | MX-M-14-30\|mx_returns_AYUN_14_30_2018\|\|1188 | /events/3040/resultRows/0 | 362.3159304 |
| event-64a407db171425962b4ef38f-r1 | MX-M-14-30 | MX-M-14-30\|mx_returns_AYUN_14_30_2018\|\|1188 | /events/3040/resultRows/1 | 171.686747 |
| event-41b5e28438be4be40ced8c46-r0 | MX-M-14-9 | MX-M-14-9\|mx_returns_AYUN_14_9_2018\|\|1191 | /events/3043/resultRows/0 | 128.6399303 |
| event-41b5e28438be4be40ced8c46-r1 | MX-M-14-9 | MX-M-14-9\|mx_returns_AYUN_14_9_2018\|\|1191 | /events/3043/resultRows/1 | 106.9747167 |
| event-f948e1f268f5ea5989968def-r0 | MX-M-14-39 | MX-M-14-39\|mx_returns_AYUN_14_39_2018\|\|1192 | /events/3044/resultRows/0 | 159.2100896 |
| event-f314e00cea66c0327fca32fd-r0 | MX-M-14-72 | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 | /events/3046/resultRows/0 | 2465.7544957 |
| event-f314e00cea66c0327fca32fd-r1 | MX-M-14-72 | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 | /events/3046/resultRows/1 | 1103.6747459 |
| event-f314e00cea66c0327fca32fd-r2 | MX-M-14-72 | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 | /events/3046/resultRows/2 | 1043.9405786 |
| event-f314e00cea66c0327fca32fd-r3 | MX-M-14-72 | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 | /events/3046/resultRows/3 | 101.7982799 |
| event-ec64f89df4fc3e6a2f07d2ab-r0 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/0 | 11255.4373522 |
| event-ec64f89df4fc3e6a2f07d2ab-r1 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/1 | 8587.0764381 |
| event-ec64f89df4fc3e6a2f07d2ab-r2 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/2 | 4213.4751773 |
| event-ec64f89df4fc3e6a2f07d2ab-r3 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/3 | 3767.178881 |
| event-ec64f89df4fc3e6a2f07d2ab-r4 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/4 | 882.9787234 |
| event-ec64f89df4fc3e6a2f07d2ab-r5 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/5 | 490.5831363 |
| event-ec64f89df4fc3e6a2f07d2ab-r6 | MX-M-14-41 | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 | /events/3051/resultRows/6 | 412.0567376 |
| event-619ff82171e36f20f4716553-r0 | MX-M-14-46 | MX-M-14-46\|mx_returns_AYUN_14_46_2018\|\|1203 | /events/3055/resultRows/0 | 180.2994142 |
| event-619ff82171e36f20f4716553-r1 | MX-M-14-46 | MX-M-14-46\|mx_returns_AYUN_14_46_2018\|\|1203 | /events/3055/resultRows/1 | 115.5131265 |
| event-c385c21b3823dd30d6d9a447-r0 | MX-M-14-45 | MX-M-14-45\|mx_returns_AYUN_14_45_2018\|\|1213 | /events/3065/resultRows/0 | 170.6957547 |
| event-c385c21b3823dd30d6d9a447-r1 | MX-M-14-45 | MX-M-14-45\|mx_returns_AYUN_14_45_2018\|\|1213 | /events/3065/resultRows/1 | 130.5424528 |
| event-86ce39fd123295258857fb16-r0 | MX-M-14-55 | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 | /events/3067/resultRows/0 | 1311.7908082 |
| event-86ce39fd123295258857fb16-r1 | MX-M-14-55 | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 | /events/3067/resultRows/1 | 446.7511886 |
| event-86ce39fd123295258857fb16-r2 | MX-M-14-55 | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 | /events/3067/resultRows/2 | 229.1600634 |
| event-3df08b5bc971df4f4b5c05a5-r0 | MX-M-14-60 | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 | /events/3069/resultRows/0 | 170.4235463 |
| event-3df08b5bc971df4f4b5c05a5-r1 | MX-M-14-60 | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 | /events/3069/resultRows/1 | 165.3266332 |
| event-3df08b5bc971df4f4b5c05a5-r2 | MX-M-14-60 | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 | /events/3069/resultRows/2 | 110.1938263 |
| event-52a50cf2eb98abe76786ac07-r0 | MX-M-14-61 | MX-M-14-61\|mx_returns_AYUN_14_61_2018\|\|1218 | /events/3070/resultRows/0 | 130.3262183 |
| event-e06ac8eeb6c9d6b541c24002-r0 | MX-M-14-65 | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 | /events/3074/resultRows/0 | 228.6322965 |
| event-e06ac8eeb6c9d6b541c24002-r1 | MX-M-14-65 | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 | /events/3074/resultRows/1 | 145.9735833 |
| event-e06ac8eeb6c9d6b541c24002-r2 | MX-M-14-65 | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 | /events/3074/resultRows/2 | 116.8015907 |
| event-f23d9bed9c5ee4d751673373-r0 | MX-M-14-66 | MX-M-14-66\|mx_returns_AYUN_14_66_2018\|\|1223 | /events/3075/resultRows/0 | 315.919761 |
| event-059a6b37f94b7f6d382cbe8d-r0 | MX-M-14-69 | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 | /events/3078/resultRows/0 | 811.2794336 |
| event-059a6b37f94b7f6d382cbe8d-r1 | MX-M-14-69 | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 | /events/3078/resultRows/1 | 508.1837642 |
| event-059a6b37f94b7f6d382cbe8d-r2 | MX-M-14-69 | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 | /events/3078/resultRows/2 | 135.2708711 |
| event-8e777777a3b9d15105f84139-r0 | MX-M-14-75 | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 | /events/3084/resultRows/0 | 403.4153692 |
| event-8e777777a3b9d15105f84139-r1 | MX-M-14-75 | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 | /events/3084/resultRows/1 | 363.0336514 |
| event-8e777777a3b9d15105f84139-r2 | MX-M-14-75 | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 | /events/3084/resultRows/2 | 288.347564 |
| event-8e777777a3b9d15105f84139-r3 | MX-M-14-75 | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 | /events/3084/resultRows/3 | 165.2938222 |
| event-8e777777a3b9d15105f84139-r4 | MX-M-14-75 | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 | /events/3084/resultRows/4 | 134.7564038 |
| event-7a639b48185b8b5ef8849d27-r0 | MX-M-14-79 | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 | /events/3089/resultRows/0 | 310.9340659 |
| event-7a639b48185b8b5ef8849d27-r1 | MX-M-14-79 | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 | /events/3089/resultRows/1 | 251.2637363 |
| event-7a639b48185b8b5ef8849d27-r2 | MX-M-14-79 | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 | /events/3089/resultRows/2 | 121.4835165 |
| event-215fc3e8a6326b7c02da6b1c-r0 | MX-M-14-99 | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 | /events/3091/resultRows/0 | 578.2951584 |
| event-215fc3e8a6326b7c02da6b1c-r1 | MX-M-14-99 | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 | /events/3091/resultRows/1 | 484.7277465 |
| event-215fc3e8a6326b7c02da6b1c-r2 | MX-M-14-99 | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 | /events/3091/resultRows/2 | 331.7857633 |
| event-215fc3e8a6326b7c02da6b1c-r3 | MX-M-14-99 | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 | /events/3091/resultRows/3 | 120.0864079 |
| event-db123f41cdcb10be7e5ad254-r0 | MX-M-14-84 | MX-M-14-84\|mx_returns_AYUN_14_84_2018\|\|1244 | /events/3096/resultRows/0 | 140.5196103 |
| event-db123f41cdcb10be7e5ad254-r1 | MX-M-14-84 | MX-M-14-84\|mx_returns_AYUN_14_84_2018\|\|1244 | /events/3096/resultRows/1 | 108.6684986 |
| event-15649ecc034999cb026fbb51-r0 | MX-M-14-92 | MX-M-14-92\|mx_returns_AYUN_14_92_2018\|\|1252 | /events/3104/resultRows/0 | 102.1328557 |
| event-22322c49cf14d9e01ad14003-r0 | MX-M-14-94 | MX-M-14-94\|mx_returns_AYUN_14_94_2018\|\|1254 | /events/3106/resultRows/0 | 115.04662 |
| event-22322c49cf14d9e01ad14003-r1 | MX-M-14-94 | MX-M-14-94\|mx_returns_AYUN_14_94_2018\|\|1254 | /events/3106/resultRows/1 | 112.7272727 |
| event-7a2836aa7eac1de379d3e3e1-r0 | MX-M-14-70 | MX-M-14-70\|mx_returns_AYUN_14_70_2018\|\|1276 | /events/3128/resultRows/0 | 120.3323131 |
| event-0bc8c51c406c0e5f49c66b37-r0 | MX-M-14-124 | MX-M-14-124\|mx_returns_AYUN_14_124_2018\|\|1284 | /events/3136/resultRows/0 | 177.4911615 |
