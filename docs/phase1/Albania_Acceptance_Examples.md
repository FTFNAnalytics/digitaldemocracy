# Albania acceptance examples

These are **11 concrete future CI scenarios**, using real package IDs/values and the mappings in [Albania_Field_Map.md](Albania_Field_Map.md). They complete the existing [Prompt C checklist](Prompt_C_Field_Map_and_CI.md); they do not replace its gates or claim an importer has run. Only the frozen package validator and read-only/document checks were executed here.

Main is `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`; register SHA-256 `7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62`. The canonical checked-in tier file is still absent. First establish that preflight logs a failed attempt for that absence, with NULL successful_release_id and no serving-file change. Successful import examples below are conditional on the accepted, checksummed file becoming available. None authorizes modifying frozen package bytes.

## 1. Unchanged re-import and fingerprint

Real anchor: office `AL-13-M`, HK `AL-13-M::2023::2023-05-14`, event `event-9b7cd1a6a6d27850e712e6a7`, result r0 `Arif Faik Tafani`, 4564 votes, share 50.26985350809561, seats NULL. Origin is H `history-index-001.json` /rows/0, workbook row 2, and D `detailed-returns-001.json` /rows/0, row 2.

Documentation vector: the 163 frozen files plus the Phase 0 draft at T's logical path yield fingerprint `a3a5208c59684e78cab83ead689bfe677b8692940211d9889e1020848c9506be` under Identity Rules. Recalculate it twice: exact same digest. This is deliberately not a valid published release because T is not checked in/approved.

Once T is accepted, run the actual importer twice from identical effective inputs. Expect different attempt UUIDs, one immutable release row with identical release_id, identical IDs and semantic values (including NULL seats and full-precision share), 122 offices / 366 selected histories / 3843 results. Allow receipt/timestamps/file-page layout to differ. The accepted-tier fingerprint will differ from the draft vector if approval edits changed its bytes. Verify both ledger success pointers against the physical receipt/release set.

## 2. Corrected import without inventing research

Use the same `AL-13-M` r0 and the real catalogue source `albania--Sfaae00802d`. First prove a pure version change: the draft hash vector with only method_version changed to `atlas-preserve-evidence/2` is `c8cf910a583db8c065698c70f73df098a6961e2b5fc3181610e82f9207af1ac7`, different from Example 1; no source facts change. This is a hash-contract test, not an implemented version bump.

For the required corrected-content importer test, make a **temporary mutant**, never the frozen package: set r0 votes from the real 4564 to NULL and place a documented test override restoring the real supplied value 4564, with the original frozen D row/hash and real source as evidence. Label both mutant and override as test-only; their production publication must be forbidden. Import the mutant in the isolated acceptance environment, then its corrected version: new release after correction; r0 ID unchanged; corrected votes=4564/recorded, original source claim and mutation provenance retained; previous snapshot auditable. Do not calculate a made-up vote total. Source-fidelity expectation in the mutant test is explicit; it does not weaken frozen-baseline checks in production.

A second variant reorders the two 2023 mayoral D rows: Arif remains r0 and Bedri r1 through baseline/semantic bindings, even when physical row order changes. Mutate an identity label without a binding override: fail rather than silently allocate a new ID to the old candidate.

## 3. Poison FK rollback and wrong namespace

Real event is `event-9b7cd1a6a6d27850e712e6a7`; real source is `albania--Sfaae00802d`. After a durable started attempt and some staged writes, deliberately omit that known source row while retaining its evidence_link, or corrupt the staged child namespace away from `cdd-observatory-v1`. These are deliberate test corruptions, not unknown research.

Expect SQL/foreign_key_check failure, nonzero importer exit, staging discarded, failed attempt durable outside it, successful_release_id=NULL, no new public release and prior serving-file hash/release set/Arif value unchanged. Repeat before validation and before rename. A post-rename crash is a receipt reconciliation test: do not falsely mark the swapped file as failed while continuing to serve it. Never convert this known missing source into unresolved_evidence.

## 4. Missing seats versus recorded zero; vote precision

Two real D rows:

| Record | Input location | Supplied values | Required stored values |
| --- | --- | --- | --- |
| AL-13-M, 2023, Arif Faik Tafani; event-9b7cd1a6a6d27850e712e6a7-r0 | detailed-returns-001.json /rows/0; workbook row 2 | votes 4564; share 50.26985350809561; seats null | votes=4564/recorded, full binary64 share/recorded, seats=NULL/unknown; elected/substitute NULL |
| AL-13-C, 2023, Partia Agrare Ambjentaliste e Shqipërisë; event-42aa961113176bd7302e00d8-r8 | detailed-returns-001.json /rows/15; workbook row 17 | votes 326; share 3.7206117324811685; seats 0 | seats=0/zero, not NULL; votes=326/recorded |

Baseline total: 399 missing seats, 1876 zero seats. There are **no missing or zero vote/share cells in the frozen detailed returns**. Test those branches only with isolated value/status mutations on the real r0 identity: NULL/unknown and 0/zero succeed structurally; NULL/zero and 0/unknown fail. Do not count these synthetic values as Albania facts, and do not publish test payloads. No source share is rounded to the HTML's two decimals.

## 5. Day, month and year precision without inventing a polling day

Real r0 event date is `2023-05-14`: precision=day, year=2023, month=5, day=14, certainty=unknown. All 366 selected histories are day precision. `AL-13-M` Next polling date is NULL; Cal cohort C082 first/end dates are also NULL. Store office next_date_id=NULL, next_history_key=NULL, resolution=unknown; proposed 2027 map text does not populate a polling date.

For isolated date-shape tests on the same event identity, reduce the **existing** date label to `2023-05` and then `2023`, explicitly marking these as deliberate information-loss test overrides with an original-HK binding. Month must store (2023,5,NULL); year (2023,NULL,NULL); no new event ID or day 1. Do not alter frozen H/D rows or present reduced labels as actual collected dates. Range/invalid-day/certainty branches remain required by the original CI checklist; they are generic schema fixtures, not invented Albania election records. An invalid day mutation must fail, not silently degrade to year precision.

## 6. Conflicting claims are retained and the resolved value withheld

Use real office `AL-52-M`, whose separate selected events include `2023-07-23` (event-fc68f2719386d599c584111d) and `2022-03-06` (event-0e6fd800ff9be3e149eeee0f). Their actual sources are:

- https://www.reporter.al/2023/07/24/memolla-i-ps-fiton-zgjedhjet-e-perseritura-ne-rrogozhine/
- https://rtsh.al/6-bashki-zgjedhin-kryetarin-e-ri-te-bashkise-ecuria-e-procesit-minute-pas-minute/

**There is no claim that these are conflicting dates for one real election.** Construct a test-only override fixture deliberately attaching these two existing dated claims to the July event, with decision=withhold. This simulates a bad upstream claim attachment without inventing a date or source. Both sources/claim IDs and original contexts remain visible; separate date_claim rows preserve each value; July event date_id=NULL and date_resolution=conflicting. The actual March event remains separate and unchanged. Do not collapse two events into a range, change the July public ID, or show a cleared derived metric. Outside this explicit fixture, a wrong event attachment fails identity validation; source context must never be rewritten silently.

## 7. Genuine inline source, unresolved token and broken FK are different

The real IRI URL `https://www.iri.org/resources/albania-survey-of-public-opinion-april-may-2026/` is one of three inline-only URLs. It becomes a genuine deterministic source row with publisher/title/access date NULL, linked to Poll retained input; its absence from the 182-row catalogue is not unresolved evidence. Preserve Poll's blocked-primary-retrieval caveat; a supplied URL does not prove successful retrieval.

The real catalogue token `Sfaae00802d` resolves to `albania--Sfaae00802d` in a full Albania import. A resolver-only unit fixture may pass that literal token with **an explicitly empty, independent resolver catalogue and no previous bindings**, expecting an unmatched token record, original locator, reason and no invented URL. This fixture demonstrates the unresolved branch only; it is not a valid reduced Albania package and must never be published. In the actual baseline the catalogue/previous binding is known, so omitting its source row is the fatal broken-FK case in Example 3, not permission to reclassify it unresolved. No genuinely unmatched citation has been asserted in the frozen mapped baseline.

## 8. Incomplete refresh retains an omitted office

Real `AL-13-M` has three selected histories, its existing geography, result vectors and `briefings/AL-13-M.html`. In a later isolated incomplete-refresh fixture, omit that office and its corresponding incoming tier row. Leave coverage_complete=false. The fixture is a controlled omission, not evidence of office abolition.

Expected: effective master retains `AL-13-M`, its geography/event/result IDs, classification, briefing and source evidence. No auto-withdrawal or identity reassignment; effective office count stays 122. Incoming reduced ID sets and effective union are checked separately. Old source files that now collide by path with changed incoming files are retained under `inherited/sha256/<old_hash>/<original_path>` and included in effective hash inputs. Repoint active release FKs consistently; original raw origin remains old hash/path. The new release differs because effective input inventory changed. Prior complete snapshot remains restorable. Explicit withdrawal is a separate sourced instruction and keeps IDs addressable.

## 9. Fixture exclusion, including retained JSON

Use a disposable copy of real `AL-13-M` as the target of fixture-taint tests; do not create a supposedly real new office. Set the test payload's provenance fixture marker or pass fixture-enabled environment `OBSERVATORY_FIXTURES=1`; also exercise synthetic FIX-/FXT- prefixes only in test data. Scan every projected entity, crosswalk and retained input, not merely office_id.

Production publication must reject fixture provenance/namespaces/prefixes and known fixture content, preserving the real serving 122-office publication. Test-only mutations in Examples 2–8 execute under the isolated CI harness and cannot enter a production input inventory. A fixture-tainted retained control/poll JSON file must fail even though no typed metric table exists. Check that the ledger failure persists.

## 10. Tier equality and zero regional count are success

Real IDs `AL-13-M`, `AL-13-C`, `AL-52-M` and the other 119 register IDs all have municipal assignments in the Phase 0 file. Require exact register SHA and full ID-set equality, then the actual accepted T hash, rationale and approved review state. Change only Cal.Tier=`Regional / municipal` in a test copy: classification output remains municipal because SQL/import mapping never reads that field as a classifier (the input change still changes fingerprint).

Expected accepted baseline: 122 municipal, 0 regional, 61 Mayor and 61 Municipal council; no dummy national/regional offices. The register has 61 jurisdictions but **122 preserved bridge geography IDs**. regional=0 passes Phase 1 storage proof. Missing canonical T fails preflight; a draft/needs-review T must not be mislabeled approved. There is no populated regional-calendar proof here; Phase 2's honest empty state remains valid.

## 11. Rrogozhinë exclusions and lossless ancillary retention

`AL-52-M` selected histories are 2023-07-23, 2022-03-06, 2019-06-30. July repeat HK is `AL-52-M::2023::2023-07-23`, public ID `event-fc68f2719386d599c584111d`, result r0 Edison Selman Memolla 6658 votes and r1 Shkëlqim Hoxha 4906. Its coverage explicitly excludes/supersedes the annulled 14 May mayoral poll. Do **not** insert a selected `AL-52-M::2023::2023-05-14` row or a fabricated annulment/certification proceeding. `AL-52-C::2023::2023-05-14` is a real separate selected council event and must survive.

Check `history-index-crosscheck.json` reconciles 366 rather than becoming +366. Briefings contain 381 h3 historical headings; only 366 match selected H rows, and unselected older history stays retained HTML. Preserve all 122 briefing hashes, including AL-13-M SHA-256 `060cddf358134dd5c96cb2f5a4322ae493401e276a28c4aacab66c4d46853f80`; scripts never execute.

For Ctl row 2, retain the exact `AL-13-M` observation dated 2026-09-09 and its stale/profile-age qualification, without asserting present affiliation or tenure. Retain all 45 Ctl rows and Poll's one IRI record (publication 2026-07-16, fieldwork 2026-04-09 to 2026-05-03, sample 1200) losslessly in retained_input, not election or metric tables. Preserve O null scores, cached formula cells and briefing withheld statement; no new tightness/competition computation. Ingested source count is 182 catalogue +3 inline, never 182 fabricated publishers.

## Remaining required CI remains unchanged

These worked examples supplement every gate in Prompt_C_Field_Map_and_CI.md; they do not waive migration, namespacing, range/parent/supersession cycle checks, source fidelity, writer contention, WAL/fsync/crash recovery, restore, unrelated-lineage continuity or the existing npm gates. The checklist's field-map outputs are marked Done with document pointers; its automated importer tests are still requirements for the implementation PR. Reserved continuity lineage IDs only: `latin-america-fe5e91689def` and `country-package-new-zealand`; no continuity rows loaded in this task.
