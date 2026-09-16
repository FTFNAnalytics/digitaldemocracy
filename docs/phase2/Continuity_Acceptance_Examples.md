# Continuity acceptance examples

Twelve worked specifications for the **future** Phase 2 importer/CI. All named offices/events/results/sources come from inspected inputs at main `5f46f9b03f24f4776ffb09feb390906b0ca75fdb`. Failure injections and hypothetical refreshes below are explicitly isolated test scenarios, not new research. No rows were loaded into SQLite and no importer/publication CI was executed in this task. Reviewed tier files and requested migration paths remain prerequisites; LatAm also requires documented resolution of the 67 share-domain violations listed in its map. Successful cases are conditional on these accepted inputs being available.

Read [LatAm map](Continuity_LatAm_Field_Map.md), [NZ map](Continuity_NZ_Field_Map.md), [identity rules](Continuity_Identity_Rules.md) and [Prompt D checklist](Prompt_D_Continuity_Checklist.md). `N=cdd-observatory-v1`; `L_LA=latin-america-fe5e91689def`; `L_NZ=country-package-new-zealand`. Symbols R_LA0/R_NZ0/R_AL0 represent **actual validated release IDs produced by the future test run**, not invented digests or existing publications.

## 1. Europe-only re-import cannot change a LatAm citation

Start with a validated master selecting `(country-package-albania,R_AL0)`, `(L_LA,R_LA0)` and `(L_NZ,R_NZ0)`. Read real office `BR-AC-G` in `data/research/countries/brazil.json.gz` and its public next event `next-8aebd96d89e6fa91d0dbe918`. Historical selected event `event-c77551f2d6bc78463fa4fe31` retains HK `BR-AC-G|2022|Decisive governor round 1|0`, date2022-10-02 and existing source `brazil--S5cd0a4c40e`.

Run only Albania import. With unchanged Albania hash inputs, expected set is still R_AL0/R_LA0/R_NZ0 and a new Albania attempt/receipt. With a documented changed Albania input, expected set is R_AL1/R_LA0/R_NZ0. In both cases:

- BR-AC-G.lineage_id=L_LA and release_id=R_LA0; office/event/source/briefing lookups remain LatAm-owned.
- The Identity Rules citation join returns R_LA0, even though publication_receipt.attempted_lineage_id is Albania.
- Canonical semantic digest of **all** LatAm-owned active and release metadata rows is unchanged, including dates, evidence, retained payloads and crosswalks. Same requirement for NZ.
- The legacy explicit release alias `latin-america-fe5e91689def` still resolves to its pinned first adoption snapshot; it does not become an Albania release.

This is the central multi-lineage acceptance gate. A global “latest dataset release” citation is a failure even if office counts look correct.

## 2. Unchanged LatAm re-import creates a new attempt, not a release

Use verified archive SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f`, the 141 frozen derivative files,18,767 archive members,21 accepted tier files, unchanged override list and exact versions. Canonical descriptors follow Identity Rules; no timestamps or Europe/NZ inputs enter this hash.

Run LatAm import twice. Each actual run has a fresh attempt UUID; successful_release_id and selected LatAm release are the same R_LA0, with exactly one immutable dataset_release row for `(L_LA,fingerprint)`. Preserve `BR-AC-G`, `event-c77551f2d6bc78463fa4fe31`, all 58,658 event IDs and raw byte hashes. Europe/NZ member pairs remain unchanged. Operational receipt, ledger timestamps and physical SQLite page bytes may differ.

Changed applicable override/tier/adapter/method/schema bytes must change the target lineage hash; changing only another lineage or a recovery file location must not. No concrete production fingerprint is claimed here because accepted tiers/migrations are missing. Do not hash an absent tier as empty bytes to make this test pass.

## 3. Status-only country and territory retain pages without dummy offices

Real `base.json.gz /countries` includes `barbados`: kind=sovereign_country, coverageStatus=screened_out, zero offices/events. Preserve the original note that the identified constituency councils are appointed, its screening-as-of label and the two supplied screen citations. One exact URL is `https://www.barbadosparliament.com/htmlarea/uploaded/File/Act/2009/The%20Constituency%20Councils%20Act,%202009.pdf`; do not invent a publisher or convert its source_date2009 into a current retrieval date.

Also retain `french-guiana`: kind=territory, partial, zero imported offices/events. Its raw2028-03 conditional scope note is not authority to create a territorial office absent from the derivative. The raw supplemental research stays retained input.

Expected:36 LatAm country/territory IDs persist, with 15 zero-office base entries and no dummy office/tier rows. Barbados/French Guiana country citations remain L_LA/R_LA0 after Europe-only re-import. Zero offices is a source inventory fact, not a claim of permanent absence of all elections.

## 4. NZ prospective event preserves supplied day and unknown time

Real race/office `NZ-CLUTHA-LAWRENCE-TUAPEKA-2026` at J `/races/1` has election_date2026-10-16, date_precision=day, close_time_local=NULL, time_zone=Pacific/Auckland and candidate_roster_status=not_yet_imported. Existing public event/HK is `next-c0501510404853fce830e425`; geography `geo-56a73f3f7a19de9864ebad10`.

Expected: event kind=special, selected_history_role=none, legal_outcome=not_held; date precision=day with(2026,10,16), certainty=expected; raw close time stays NULL. Office.next_history_key points to that real event. Candidate array remains empty/uncollected, not unopposed; no result rows, seats=0, elected=false or current holder are invented. The supplied NZ-S04 citation resolves to `new-zealand--NZ-S04`.

All four real NZ prospective dates supply day precision. A future isolated mutation reducing this date to2026-10 must keep day=NULL and the same event ID, with an explicitly compatible test-only date_precision change; it is not a real package claim. The actual source validator correctly requires the frozen baseline's supplied full dates.

## 5. Real partial dates must not acquire a day

LatAm supplies actual partial-date examples, so generic partial-date coverage need not invent NZ research:

| Real office | Existing event/HK | Original label and certainty | Expected date components |
| --- | --- | --- | --- |
| BZ-BELIZECITY-M | next-202cbd5c65ea0da173a2665b | 2027-03, expected | year2027, month3, dayNULL; month precision |
| AG-BARBUDA-COUNCIL | next-95f01c6a62f856d7266fea5d | 2027, expected | year2027, monthNULL, dayNULL; year precision |
| AR-CB-GAIMAN-M | next-2293c63424248a2f7b95fe7f | Original narrative label, expected, precision unknown | all components NULL; preserve whole narrative |

Do not reparse the Gaiman narrative into a more precise date during a continuity pass. Test interval-overlap behavior without persisting synthetic day 1 endpoints: Belize March overlaps a window covering part of March; Barbuda2027 overlaps any included2027 subinterval; unknown does not confirm inclusion. These data tests do not implement a calendar UI or require regional offices.

## 6. Actual missing votes versus reported zero

Two real Argentina rows distinguish the states:

| Real row | Exact source values | Expected Atlas values |
| --- | --- | --- |
| event-04e8c7cbc66568b0bfa60d50-r3; office AR-PBA-M-096; HK AR-PBA-M-096\|2025-PBA\|\|581; PARTIDO LIBERTARIO | votes0, share0, seats0; all status zero | Each number remains0/zero |
| event-45d3e160760faeb54fc61c8f-r0; office AR-MZ-14-M; Norma Trigo | votesNULL/unknown, share61.71/recorded, seatsNULL/unknown | NULL stays missing; 61.71 copied, no invented vote total or party affiliation |

LatAm totals:35,995 zero votes and 486 missing votes; 50,239 zero seats and 179,975 missing seats. Reject NULL/zero status or nonnull/unknown mismatches in isolated corruptions. Keep supplied elected flags separate from seat counts. Never recompute a vote share from a guessed electorate/ballot count.

A separate **actual DDL incompatibility** is `event-c53481f1c2af40473903c6dd-r0`, office `MX-M-14-8`, HK `MX-M-14-8|mx_returns_AYUN_14_8_2018||1166`, decoded Mexico pointer `/events/3018/resultRows/0`: supplied share382.2657055/recorded with unitpercent_0_100. There are67 such Mexico rows. With no reviewed override, this real baseline must fail target import and leave other lineages served; do not relabel it missing, clamp it or select raw.share57.96064959400375 automatically. After an actual reviewed override selecting a supported value or explicit withholding, check corrected value/status, retained original claim, unchanged resultID, new target release and unchanged Europe/NZ. The map enumerates all 67 exact rows.

## 7. NZ historical results and prospective candidate IDs remain distinct

Real `NZ-BULLER-WESTPORT-2025-R01` is Shayne BARRY, votes1460, affiliationIndependent, elected=true, vote_shareNULL. Preserve the result ID, votes1460/recorded, elected_flag1 and missing share. `NZ-BULLER-WESTPORT-2025-R03` Philip RUTHERFORD has affiliationNULL; do not default it to Independent. H.seats6 is event context; result seats remain NULL/unknown, not6 for every candidate.

`NZ-BULLER-WESTPORT-2022` has12 provisional_legacy_mirror rows: evidence_status remains preliminary. It is one of the three historical events, not an extra current race. `NZ-BULLER-WESTPORT-2026-C01` Douglas Ward is a prospective candidate with votes/elected NULL: preserve it as an input alias at J `/races/0/candidates/0`, linked to its real source, not result_row or current officeholder.

Expected4 offices,7 events,36 historical result rows,11 retained prospective candidates and 12 sources. Do not combine to47 results, create eleven candidates as offices, calculate party shares from marks, or link people across years merely by similar names.

## 8. Poison source FK leaves all prior lineages served

Start from validated Europe+LatAm+NZ publication. Commit a started NZ attempt durably. After staged writes, deliberately omit known source `new-zealand--NZ-S01` while retaining its Buller evidence link; separately test a wrong N in the child event key. These are explicit test corruptions, not unresolved source research.

Expected nonzero exit, foreign_key_check/typed-reference failure, discarded staging, failed ledger row with successful_release_id=NULL, no new public release, prior physical serving file/release set unchanged. The BR-AC-G citation and the previous NZ Buller page remain on their old releases. Never “recover” by publishing an NZ-only or Europe-only database, deleting the citation, or relabeling a known missing source as unresolved.

For a genuine unmatched-token resolver unit test, use a clearly isolated resolver fixture with no prior catalogue bindings; retain its literal token/locator/reason, no fabricated source. It must not be presented as a real missing NZ-S01, which exists in this baseline. Crash-after-rename is tested separately through receipt reconciliation; do not mark failure while serving an unacknowledged swapped publication.

## 9. Fixture exclusion covers retained input and aliases

Use isolated test copies of real `BR-AC-G` and `NZ-BULLER-WESTPORT-2026` as targets for fixture-taint tests. Add synthetic fixture provenance, a FIX-/FXT- ID or known fixture namespace in the test payload only; enable OBSERVATORY_FIXTURES in a test environment. Do not introduce any supposedly real new office.

The production publication path must reject taint anywhere in typed records, evidence, source targets, crosswalk aliases and retained JSON—including a withheld metric or prospective-candidate object that has no dedicated table. Europe/LatAm/NZ last-good release pairs remain served and the failure is durably logged. A code file containing a literal fixture-rejection rule is not itself research fixture data: validate parsed payload provenance/identity contexts, not a naive substring scan of documentation/scripts.

## 10. Other history and existing recount keep their public IDs

Real historical office `SV-OLD-12-1` has event `event-467872c8fb089f392cd4a5dc`, HK `SV-OLD-12-1|SV-OLD-12-1-2018-repeat||524`, role=other, ballot2018-03-04. Its existing supplied proceeding is `proceeding-c1c35cc6162d072ce71d73af`, kind=recount, legal_outcome=unknown; raw recount_date2018-05-14 and certification_date2018-05-23 remain retained evidence.

Keep this event/proceeding on the same namespaced historical office. Do not delete it when selecting only36,750 preferred histories, reclassify it as current office, or create another certification proceeding from the raw date. Preserve all 13,697 existing legacy proceedings with provenance/notes, distinguishing legacy projection from independent legal verification. Do not assign its result rows to a proceeding when no such result-level link is supplied.

All58,658 event IDs and 269,740 result IDs must survive. The 40,509 legacy historical subtotal is selected+other, and 18,149 prospective events are additional.

## 11. Missing tier file fails closed without a regional-count gate

Actual main has no reviewed `schemas/atlas/tiers/new-zealand.json` or the 21 required LatAm country files, e.g. `schemas/atlas/tiers/brazil.json`. A source O.tier=regional on BR-AC-G or the NZ bridge's council heuristic is not a reviewed Atlas classification.

Attempting import now must record missing-input error, no successful release and no last-good publication change. Do not fill all rows with other/unknown as an importer fallback, copy calendar labels or bypass mutual office/classification FKs. A future accepted file must cover every supplied office—including414 historical LatAm offices—and explicitly document any unknown row; status-only Barbados needs no fake classification.

After valid reviewed files exist, the tier-file/register equality gate must pass **independently** of regional count. No assertion requires positive regional offices. A Europe regional count of0 remains a valid empty state; LatAm legacy tier counts do not become Europe coverage or change the default landing.

## 12. Incomplete refresh and original-briefing aliases

Real `AG-BARBUDA-COUNCIL` has original path `Briefings/Antigua_and_Barbuda/d4e1810db0f202d9c3fa.html` in legacy-links.json and a cleaned entry in briefings/antigua-and-barbuda.json.gz. In an isolated later incomplete LatAm refresh, omit this office and associated incoming rows. Absence is not withdrawal.

Expected: retain the office, its three historical events plus prospective `next-95f01c6a62f856d7266fea5d`, result/source bindings, tier and both original/cleaned briefing provenance. If incoming paths now hold changed bytes, retain original dependencies at inherited/sha256/<old_hash>/<original_path>, include them in effective fingerprint and repoint only target-lineage active provenance to the new R_LA1. Keep previous R_LA0 metadata/full snapshot and preserve every public ID. Europe/NZ release IDs/rows stay unchanged.

Verify original briefing hash against M.inventory and original ZIP member; sanitized BF text is not the original byte stream and cannot borrow its checksum. Original-file aliases resolve through a typed input locator, not a new office or invented artifact ID. An explicit sourced withdrawal is a separate accepted override retaining addressability. Restore R_LA0 into scratch and recheck this actual office/event/briefing binding before claiming the restore gate.

## Verification boundary

Executed here: frozen input hash/count/ID checks, original ZIP-member/object reconciliation, existing NZ validator, read-only reference/value-shape checks and document coverage/link checks. The shape check found 67 real Mexico share-domain violations; these are recorded blockers, not represented as passed compatibility checks. Not executed: an Atlas importer, database research load, OS publication/rollback/restore or website route tests. Prompt D keeps those CI/cutover gates open. No new research values or classifications were introduced; synthetic failure/refresh scenarios remain test specifications only.
