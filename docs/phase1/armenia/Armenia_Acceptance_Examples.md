# Armenia worked acceptance examples

Main `7af805b5dbb123c4cd3f0e6ccd2ea63bc5f34d45`; **approved tier `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`**. These are documentation assertions for future Cursor implementation, **execution CI Not run**. All unmarked examples use frozen inputs. Synthetic negative/mutation cases are explicitly isolated and never production research/overrides. JSON shapes show relevant columns; remaining columns follow [Field Map](Armenia_Field_Map.md). Every research row owns L=`country-package-armenia` and R=`country-package-armenia--sha256-d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e`; N=`cdd-observatory-v1`. V paths are virtual unpacked member locators, not git paths. [Vectors](Armenia_Identity_Vectors.json) enumerate every baseline row and hash.

## 1. Approved municipal tier and honest empty regional calendar

`data/countries/armenia/unpacked/tables/master/office-register.json` SHA `23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d`, pointer `/rows/0/3`, sheet `Office register`, source row `133`. Approved T `/classifications/0` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`.

```json
{
  "office": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AM-ABOVYAN-C",
    "office_type": "Municipal council (proportional; mayor elected by council)"
  },
  "office_tier_classification": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AM-ABOVYAN-C",
    "tier": "municipal",
    "review_status": "approved",
    "classification_path": "schemas/atlas/tiers/armenia.json",
    "classification_kind": "tier_classification",
    "classification_sha256": "2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a"
  }
}
```
Assert T office set equals all 71 O IDs; regional count=0. Calendar output is an honest empty state, not failure: “No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.” Do not treat the shared archive/calendar filename as a regional tier classifier.

## 2. Council elects mayor; preserve actual mayor IDs

`data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/41/20`, sheet `Jurisdictions`, source row `43`. Notes say public elects council and there is no separate direct mayoral ballot. Exactly one supplied `AM-ABOVYAN-C` office remains; no added mayor counterpart.

`data/countries/armenia/unpacked/tables/master/office-register.json` SHA `23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d`, pointer `/rows/3`, sheet `Office register`, source row `136`. This different register row really is a Mayor:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AM-ALAGYAZ-M",
  "country_id": "armenia",
  "geography_id": "geo-20f09adedcd81820fb8036ac",
  "office_type": "Mayor",
  "office_status": "current",
  "record_state": "active"
}
```
Assert exact71 IDs, including 8 existing mayors, 55 proportional councils and 8 majoritarian councils; do not remove real mayors to satisfy “councils only.”

## 3. Vedi seats-only replacement and separate December history

`data/countries/armenia/unpacked/tables/companion/histories.json` SHA `37c8d53e94279c7adb625458492ed372d94e8c57f19efaf3ea43cd4e2c2a856e`, pointer `/rows/8`, sheet `Histories`, source row `10`.

```json
{
  "office_id": "AM-VEDI-C",
  "history_key": "AM-VEDI-C::2022::2022-03-27",
  "event_id": "event-3709c57863b238002e1c27a2",
  "event_kind": "special",
  "label": "2022-03-27",
  "precision": "day",
  "certainty": "unknown",
  "selected_history_role": "selected",
  "ballot_basis": "unknown",
  "legal_outcome": "unknown"
}
```
`data/countries/armenia/unpacked/tables/companion/histories.json` SHA `37c8d53e94279c7adb625458492ed372d94e8c57f19efaf3ea43cd4e2c2a856e`, pointer `/rows/9`, sheet `Histories`, source row `11`.

```json
{
  "office_id": "AM-VEDI-C",
  "history_key": "AM-VEDI-C::2021::2021-12-05",
  "event_id": "event-af17499c6f00b387a428f510",
  "event_kind": "ordinary",
  "label": "2021-12-05",
  "precision": "day",
  "certainty": "unknown",
  "selected_history_role": "selected",
  "ballot_basis": "valid_votes",
  "legal_outcome": "preliminary"
}
```
`data/countries/armenia/unpacked/tables/companion/full-results.json` SHA `92dfb1315d8bf9ea1d27cf9fb93183bcff7010fd125d755c746b57bfe436a88a`, pointer `/rows/19`, sheet `Full results`, source row `21`. Exact numeric projection:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AM-VEDI-C",
  "history_key": "AM-VEDI-C::2022::2022-03-27",
  "result_row_id": "event-3709c57863b238002e1c27a2-r0",
  "candidate_or_list_label": "Civil Contract",
  "votes": null,
  "votes_status": "unknown",
  "share": null,
  "share_status": "unknown",
  "share_unit": "percent_0_100",
  "seats": 16,
  "seats_status": "recorded",
  "evidence_status": "recorded",
  "proceeding_id": null,
  "party_mapping_id": null,
  "elected_flag": null,
  "is_substitute": null
}
```
D next row `/rows/20` has 11 seats and also null votes/share. Both supplied result rows stay; no votes=0, no seat-share calculation, no elected_flag inference. December2021 and March2022 remain distinct actual events. No invented proceeding and no selected2016 predecessor event.

## 4. Partial reported votes do not supply missing denominator or seats

`data/countries/armenia/unpacked/tables/companion/full-results.json` SHA `92dfb1315d8bf9ea1d27cf9fb93183bcff7010fd125d755c746b57bfe436a88a`, pointer `/rows/5`, sheet `Full results`, source row `7`. D.Vote basis says “Reported candidate/list counts; denominator or full vector incomplete.”

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AM-TSAGHKAHOVIT-C",
  "history_key": "AM-TSAGHKAHOVIT-C::2022::2022-09-25",
  "result_row_id": "event-d9c3dd52ffb136ac20ac08b9-r0",
  "candidate_or_list_label": "Civil Contract",
  "votes": 2299,
  "votes_status": "recorded",
  "share": null,
  "share_status": "unknown",
  "share_unit": "percent_0_100",
  "seats": null,
  "seats_status": "unknown",
  "evidence_status": "recorded",
  "proceeding_id": null,
  "party_mapping_id": null,
  "elected_flag": null,
  "is_substitute": null
}
```
Do not divide2299 by the visible top-two counts to invent a share. Seats remain NULL/unknown. All 97 rows round-trip, including 20 missing shares and 95 missing seat values. No reported numerical zeros occur baseline; a later explicit0 must map to zero status, never unknown.

## 5. A supplied prospective date preserves precision and its stated certainty

`data/countries/armenia/unpacked/tables/master/office-register.json` SHA `23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d`, pointer `/rows/1/4`, sheet `Office register`, source row `134`; confirmation note `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/52/20`, sheet `Jurisdictions`, source row `54`; source `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/52/22`, sheet `Jurisdictions`, source row `54`.

```json
{
  "office": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AM-AKHURYAN-C",
    "next_date_id": "date-79cd96c165bfef62ed13ad7d7ba7f9841e254dc084892bab2899c814dcd5ff33",
    "next_date_resolution": "resolved",
    "next_history_key": "next-6fdd004459069a780b5f2d39"
  },
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AM-AKHURYAN-C",
    "history_key": "next-6fdd004459069a780b5f2d39",
    "event_id": "next-6fdd004459069a780b5f2d39",
    "date_id": "date-79cd96c165bfef62ed13ad7d7ba7f9841e254dc084892bab2899c814dcd5ff33",
    "date_resolution": "resolved",
    "selected_history_role": "none",
    "event_kind": "unknown",
    "legal_outcome": "not_held"
  },
  "research_date": {
    "date_id": "date-79cd96c165bfef62ed13ad7d7ba7f9841e254dc084892bab2899c814dcd5ff33",
    "label": "2026-10-25",
    "precision": "day",
    "certainty": "called",
    "year": 2026,
    "month": 10,
    "day": 25,
    "range_start_id": null,
    "range_end_id": null
  }
}
```
“Called” records the frozen source’s office-specific CEC confirmation, not an independently obtained decree. Retain original news citation and evidence grade; no promotion to statutory. Cal generic first/end dates never override this supplied day.30 prospective IDs stay unchanged.

## 6. Boundary/calendar approval scope — all five research questions remain open

- **AM-ARARAT-C**: approved T `/classifications/9` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`; J notes `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/13/20`, sheet `Jurisdictions`, source row `15`.
- **AM-MASIS-C**: approved T `/classifications/44` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`; J notes `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/14/20`, sheet `Jurisdictions`, source row `16`.
- **AM-PAMBAK-C**: approved T `/classifications/52` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`; J notes `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/31/20`, sheet `Jurisdictions`, source row `33`.
- **AM-VANADZOR-C**: approved T `/classifications/65` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`; J notes `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/27/20`, sheet `Jurisdictions`, source row `29`.
- **AM-VEDI-C**: approved T `/classifications/68` at `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`; J notes `data/countries/armenia/unpacked/tables/companion/jurisdictions.json` SHA `ac67a83d49336bd08b8b89c8db4598c2ac5a9065925fdfc1cfb6df93605f86be`, pointer `/rows/15/20`, sheet `Jurisdictions`, source row `17`.

Expected common shape for each:

```json
{
  "office": {
    "next_date_id": null,
    "next_date_resolution": "unknown",
    "next_history_key": null
  },
  "office_tier_classification": {
    "tier": "municipal",
    "review_status": "approved"
  },
  "retained_classification_row": {
    "human_review_required": false,
    "tier_uncertain": false,
    "boundary_calendar_review": {
      "status": "open",
      "human_review_required": true,
      "scope": "research_boundary_and_calendar_only"
    }
  }
}
```
Ararat/Pambak/Vedi merger proposals remain monitoring questions; Masis reported delay needs enacted-law verification; Vanadzor has both. No postponement or merger is assumed. Pambak has 0 recorded histories, not 0 real elections. The former unsuffixed Vedi prompt token is not an office or alias.

## 7. Companion/index overlap reconciles once

`data/countries/armenia/unpacked/tables/companion/histories.json` SHA `37c8d53e94279c7adb625458492ed372d94e8c57f19efaf3ea43cd4e2c2a856e`, pointer `/rows/0`, sheet `Histories`, source row `2` and `data/countries/armenia/unpacked/history-index.json` SHA `bc6216635ecf634ccbb583e264d9a52a466ebfc2b571e291b1dd39a797546224`, pointer `/7`, sheet `None`, source row `None`.

```json
{
  "office_id": "AM-ASHTARAK-C",
  "history_key": "AM-ASHTARAK-C::2021::2021-12-05",
  "event_id": "event-7afc918cdb5a02b132b6f222",
  "date_id": "date-35033a73e77cf186473639ffc5fa71dfe967c5acb65c267c0d9008257a65314d",
  "selected_history_role": "selected"
}
```
Both refer to one selected event. H determines detailed event semantics; IX supplies reconciliation/extra comparability raw. Assert33 unique historical keys, not 66; adding30 next identities gives63 total. Never turn leader/runner summary columns into more than the 97 actual D rows.

## 8. Canonical source union, URL alias, and real inline reference

`data/countries/armenia/unpacked/tables/companion/sources.json` SHA `e2a0b284e2691967c606d23d8d12562a8c3c17b474927c2618677c39bf60f263`, pointer `/rows/2`, sheet `Sources`, source row `4`. This catalogue row is present only in companion sources even though source-links marks its URL absent from master:

```json
{
  "country_id": "armenia",
  "source_namespace": "country-package-armenia",
  "source_id": "armenia--S33ef796aa5",
  "url": "https://news.am/en/news/1056666",
  "title": "CEC October 25, 2026 community schedule",
  "publisher": null,
  "evidence_grade": "Public reporting of CEC returns; primary certification not independently obtained",
  "checked_as_of_label": "2026-09-08",
  "file_sha256": null,
  "bridge_alias_to_crosswalk": "armenia--url-80d015195f108a8bd7b8de20"
}
```
`data/countries/armenia/unpacked/tables/master/country-notes.json` SHA `52f6c54d8ebba65252416da0759a57f5659b97ed72e65f7f0bfd4762927d701a`, pointer `/rows/0/4`, sheet `Country notes`, source row `5`. Genuine inline-only CRRC screening source:

```json
{
  "country_id": "armenia",
  "source_namespace": "country-package-armenia",
  "source_id": "armenia--url-45e690d8d677bdccd9b32e52",
  "url": "https://www.crrc.am/publications/public-perceptions-of-democracy/",
  "title": null,
  "publisher": null,
  "checked_as_of_label": null,
  "file_sha256": null
}
```
15 master+19 companion rows reconcile to 19 canonical catalogues; CRRC makes20, not 39 or 24. Its link creates no national poll record. All original occurrences remain separately addressable.

## 9. Unchanged and changed effective-input fingerprints

Use all 100 exact descriptors in [inventory](Armenia_Input_Inventory.json), including finalized T SHA `2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a`.

```json
{
  "dataset_release": {
    "lineage_id": "country-package-armenia",
    "release_id": "country-package-armenia--sha256-d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e",
    "fingerprint_sha256": "d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e"
  },
  "unchanged_reimport": {
    "new_attempt_id": "fresh runtime attempt UUID; not a fixed example ID",
    "same_release_id": "country-package-armenia--sha256-d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e",
    "publication_set": "same selected releases; new operational receipt permitted"
  }
}
```
Isolated canonical-hash probe only: changing method_version to atlas-preserve-evidence/2 yields `18079090bcb5ee56b578eab3526cc3fe04e65e582cb9a51ee81752c249773fe0` and a different candidate R. It is not an accepted method change or imported research. Likewise an accepted sourced correction to the D `/rows/19` seat claim would require exact original16, evidence, a reviewed identity binding if identity changes, and a new fingerprint; no replacement number is invented here.

## 10. Precision, missing≠zero and conflict probes — isolated synthetic CI inputs

Base real row is Akhuryan O date `data/countries/armenia/unpacked/tables/master/office-register.json` SHA `23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d`, pointer `/rows/1/4`, sheet `Office register`, source row `134`. In an isolated test copy only, replace its date claim with label `2026-10`: expected precision=month, year2026,month10,day=NULL; with `2026`: precision=year,month/day=NULL. These are test labels, not frozen Armenia research. Preserve the existing next event identity; original day-labelled claim remains auditable.

Base real D `/rows/5/6` Seats is NULL: expected seats=NULL,seats_status=unknown. A separate test-only copy with explicit integer0 must yield seats=0,seats_status=zero; a nonnumeric token fails. Never write either probe to frozen bytes. For an isolated conflicting date-claim pair, create separate claim date rows using the Identity Rules formula, retain both evidence locators, and set selected date pointer NULL,resolution=conflicting (plus office.next_history_key=NULL). Do not choose an arbitrary earlier date.

## 11. Unresolved citation, poison FK rollback and fixture rejection — CI specification

`data/countries/armenia/unpacked/tables/companion/full-results.json` SHA `92dfb1315d8bf9ea1d27cf9fb93183bcff7010fd125d755c746b57bfe436a88a`, pointer `/rows/19`, sheet `Full results`, source row `21` gives real Source ID `S21f66e8a49` and its EVN URL. Normal result evidence resolves to `(armenia,country-package-armenia,armenia--S21f66e8a49)`. In a poison staging copy, omit that known source while keeping its resolved evidence: FK validation must fail and roll back; durable attempt=failed, successful_release_id=NULL; last good publication and all other lineages remain served. Do not fabricate a source or demote the resolved reference to unresolved.

A separate isolated unknown-token mutation in the same citation field produces unresolved_evidence with original_token, exact test-input hash/pointer and reason=unmatched_catalogue_token, against the real result locator; no fake source FK. It is not a baseline unresolved count. Fixture probes use excluded FIX-/FXT- identities or fixture provenance in test copies only; production preflight must reject them before publication. Execution remains Not run.

## 12. Incomplete refresh, absent controls and inert artifacts

`data/countries/armenia/unpacked/tables/master/office-register.json` SHA `23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d`, pointer `/rows/52`, sheet `Office register`, source row `185` records History entries=0 and Next polling date=NULL. Expected office active, approved municipal tier, no invented history/result/control record. Outer coverage.json `/current_control_records` is the string "0" describing supplied records; it is not an observed zero government/control value. Retain it exactly.

If a later incomplete package omits this office, retain its prior office/tier/geography/evidence/aliases and recoverable source bytes, include inherited descriptors in effective fingerprint, and do not withdraw/delete. First import cannot invent prior rows.

`data/countries/armenia/unpacked/Office_Briefings/Offices/AM-PAMBAK-C.html` SHA `3cb85dfc2ba07a484030328bf73cbbe14729125a7ff32d6a8b59b08314b758dd`, pointer ``, sheet `None`, source row `None`. Expected retained_input kind=artifact,payload_json=NULL,byte_count/hash exact,recovery_locator content-addressed. Parse only inert links/text for evidence; execute no scripts. Keep companion briefings/score gates and original XLSX raw; no tightness/competition/control tables are created.
