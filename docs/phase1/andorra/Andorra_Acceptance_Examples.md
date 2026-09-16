# Andorra worked acceptance examples

**Specifications, not executed importer tests.** Pinned `bc1d1a9b1c437ca0da309e3820967d4e29ff919d`; source locators and identity/fingerprint vectors were checked read-only. Examples 1–7 use actual frozen inputs. Examples 8–12 are explicitly isolated future CI mutations/operational scenarios: they are not new Andorra research, accepted overrides or permission to edit the frozen package.

JSON blocks show the named destination table's typed research columns. Unless explicitly displayed, append `lineage_id=country-package-andorra`, `release_id=R` from Example 1 and raw_json as the lossless envelope in the field map, using the stated locator/entire original row. This common suffix is normative, not a placeholder for invented research. No SQL INSERTs or importer code are supplied.

## Example 1 — Unchanged re-import fingerprint

Exact locators: all 28 `/hash_inputs/inputs` entries in [Andorra_Input_Inventory.json](Andorra_Input_Inventory.json), including `schemas/atlas/tiers/andorra.json#/classifications`, whose original-byte hash is `b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014`, status approved. Input paths, bytes, kind and hashes are fully enumerated. The canonical hash object uses the unchanged two migrations and this map's version constants.

Expected dataset_release projection:
```json
{
  "lineage_id": "country-package-andorra",
  "release_id": "country-package-andorra--sha256-55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983",
  "fingerprint_sha256": "55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983",
  "adapter_version": "atlas-andorra-field-map/1",
  "method_version": "atlas-preserve-evidence/1",
  "schema_version": "atlas-master/1",
  "research_snapshot_label": "2026-09-11",
  "upstream_release_id": "country-package-andorra",
  "research_coverage_complete": 0
}
```

hash_inputs_json must equal the companion's hash_inputs_canonical_json byte-for-byte; validated_counts_json equals its verified_counts only after real importer validation. Two actual invocations get distinct generated attempt-UUIDv4 IDs, both successful_release_id=R after successful publication, one immutable dataset_release for this fingerprint. No fabricated attempt IDs/timestamps here. Operational receipt changes are allowed; research values/IDs and R do not. This is a candidate vector, **not a published release**.

## Example 2 — Full-date event and exact numerical result

History: `data/countries/andorra/tables/history-index.json#/rows/0` (sheet History index, source_row=374; SHA-256 `d5532e56a0b38600091719935d9e013059be16b72916948657f719e974aaf686`). Result: `data/countries/andorra/tables/detailed-returns.json#/rows/0` (sheet Detailed returns, source_row=3872; SHA-256 `bc9ffbbc55cde4155028fb88d0e805910d82888a0a95ec2a09790cf459dba5d1`). BF kind evidence: `data/countries/andorra/briefings/AD-M-05.html`, h3_index=0, exact text `2023-12-17 — Ordinary election`; BF byte hash is in Input Inventory. URL is exactly `https://www.eleccions.ad/resultats`, canonical source `andorra--S6550aa0914` from S row2 (source_row=712).

Expected research_date:
```json
{
  "date_id": "date-0ecd8b20f6a8c3221bf2be84a21d404a604d604200000ab6ffec6e793eac4228",
  "label": "2023-12-17",
  "precision": "day",
  "certainty": "unknown",
  "year": 2023,
  "month": 12,
  "day": 17,
  "range_start_id": null,
  "range_end_id": null
}
```

Expected election_event:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "history_key": "AD-M-05::2023::2023-12-17",
  "event_id": "event-321b029bb122c1284e83dd89",
  "date_id": "date-0ecd8b20f6a8c3221bf2be84a21d404a604d604200000ab6ffec6e793eac4228",
  "date_resolution": "resolved",
  "event_kind": "ordinary",
  "selected_history_role": "selected",
  "electoral_system": null,
  "comparability": "Full official list-vote and seat vector · Eligible vote basis",
  "ballot_basis": "valid_votes",
  "share_unit": "percent_0_100",
  "legal_outcome": "unknown",
  "record_state": "active",
  "state_note": null
}
```

Expected result_row:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "history_key": "AD-M-05::2023::2023-12-17",
  "result_row_id": "event-321b029bb122c1284e83dd89-r0",
  "proceeding_id": null,
  "country_id": "andorra",
  "candidate_or_list_label": "ENCLAR",
  "original_party_label": "ENCLAR",
  "original_party_code": "ENCLAR",
  "party_namespace": "andorra/2023",
  "party_mapping_id": null,
  "votes": 1989,
  "votes_status": "recorded",
  "share": 52.46636771300449,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 9,
  "seats_status": "recorded",
  "elected_flag": null,
  "is_substitute": null,
  "evidence_status": "recorded"
}
```

Create event and separate date evidence links to the supplied source; result gets its own result link with D locator. Full share precision survives; no rounding or FPTP/PR inference; no proceeding is invented from an official source title.

## Example 3 — Real year-only history, no invented day

Source: `data/countries/andorra/tables/history-index.json#/rows/1` (sheet History index, source_row=375; SHA-256 `d5532e56a0b38600091719935d9e013059be16b72916948657f719e974aaf686`). Ballot date is `/rows/1/3=null`; Year `/rows/1/4=2019`. BF h3_index=1 is exactly `2019 — Ordinary election`. Catalogue source S row1/source_row711 is `andorra--S8552cf6cc0`, URL `https://www.eleccions.ad/documentacio/anteriors/EC_2019.pdf`.

Expected research_date:
```json
{
  "date_id": "date-7b79df0c40343166701f0f59344247757cbd2dfc6aff6ae17318f9aafecd2724",
  "label": "2019",
  "precision": "year",
  "certainty": "unknown",
  "year": 2019,
  "month": null,
  "day": null,
  "range_start_id": null,
  "range_end_id": null
}
```

Expected event identity/date fields:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "history_key": "AD-M-05::2019::",
  "event_id": "event-02706181e65e03e35a10c899",
  "date_id": "date-7b79df0c40343166701f0f59344247757cbd2dfc6aff6ae17318f9aafecd2724",
  "date_resolution": "resolved",
  "event_kind": "ordinary"
}
```

HK retains its empty date suffix. Precision=year, certainty=unknown, month/day=NULL, resolution=resolved (one unambiguous year, not a known day). This applies to all fourteen 2015/2019 histories. A future interval filter for 2019-06-01 through 2019-06-30 includes this historical year by overlap; it must not store 2019-01-01. This does not create a prospective calendar row.

## Example 4 — Approved municipal tiers and honest empty regional calendar

Source O: `data/countries/andorra/tables/office-register.json#/rows/0` (sheet Office register, source_row=126; SHA-256 `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f`). T: `schemas/atlas/tiers/andorra.json#/classifications/0`; approved-file hash `b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014`. Exact ID is AD-M-05. Cal `/rows/0/3` is `Regional / municipal`; it does not participate in tier conversion.

Expected office_tier_classification:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "tier": "municipal",
  "review_status": "approved",
  "rationale": "Sourced office type is Communal council (parish). Accepted Phase 0 Prompt A classifies every Andorra communal council as municipal. Workbook calendar cohort string 'Regional / municipal' is not a classifier.",
  "classification_path": "schemas/atlas/tiers/andorra.json",
  "classification_kind": "tier_classification",
  "classification_sha256": "b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014"
}
```

All seven classifications join existing offices, with file ID-set equality. A regional query scoped to country andorra returns `[]`, count 0, and coverage text “No regional tier in this package; seven municipal councils.” Denominator stays unknown. No added regional office/event and no positive-numerator CI assertion. Altering the cohort label in an isolated test must not change stored tier (although changed input bytes change the fingerprint).

## Example 5 — Null next date and pending late-2027 context

Source O next date: `data/countries/andorra/tables/office-register.json#/rows/0/4` (sheet Office register, source_row=126; SHA-256 `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f`). Cal date cells: `data/countries/andorra/tables/election-calendar.json#/rows/0/4` (sheet Election calendar, source_row=24; SHA-256 `aa444f13e0864e3e2cee3903249be2cc456d6449c89d9dabe655bd4f3da624a4`) and `/rows/0/5` (End or runoff date), both null. Cal `/rows/0/6` is `Scheduled cycle / expected; details vary`; country-notes `/rows/0/1` states that the exact late-2027 polling day remains uncollected.

Expected office projection:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "country_id": "andorra",
  "geography_id": "geo-59eee2ef1a3df387bf66a0f6",
  "name": "Andorra la Vella — Communal council",
  "office_type": "Communal council",
  "office_status": "current",
  "record_state": "active",
  "state_note": null,
  "registry_qualified": null,
  "next_date_id": null,
  "next_date_resolution": "unknown",
  "next_history_key": null
}
```

No prospective election_event or next research_date is generated. Cal/Country notes remain complete retained inputs, including expectation and source URL. Date status does not change historical certainty. Country.coverage_status=partial and dataset_release.research_coverage_complete=0 persist.

## Example 6 — Reported zero seats versus missing raw score

Actual zero-seat result: `data/countries/andorra/tables/detailed-returns.json#/rows/4` (sheet Detailed returns, source_row=3876; SHA-256 `bc9ffbbc55cde4155028fb88d0e805910d82888a0a95ec2a09790cf459dba5d1`). Expected result_row:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AD-M-05",
  "history_key": "AD-M-05::2019::",
  "result_row_id": "event-02706181e65e03e35a10c899-r2",
  "proceeding_id": null,
  "country_id": "andorra",
  "candidate_or_list_label": "Terceravia + Independents",
  "original_party_label": "Terceravia + Independents",
  "original_party_code": "Terceravia + Independents",
  "party_namespace": "andorra/2019",
  "party_mapping_id": null,
  "votes": 394,
  "votes_status": "recorded",
  "share": 10.384818133895624,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 0,
  "seats_status": "zero",
  "elected_flag": null,
  "is_substitute": null,
  "evidence_status": "recorded"
}
```

`seats=0,seats_status=zero` is distinct from NULL/unknown. All 53 baseline seat counts are actually supplied; no baseline missing-seat example is claimed. Missing result values are exercised in Example 8's isolated mutation.

Actual retained score contrast: O `/rows/2/0=AD-M-02`, `/rows/2/10=0` (Encamp); O `/rows/1/0=AD-M-01`, `/rows/1/10=null` (Canillo). Source path is `data/countries/andorra/tables/office-register.json`, same fixed register hash. Expected retained_input.payload_json preserves both cells literally. No metric row, guessed zero for Canillo or recomputed score; all Pedersen nulls remain null.

## Example 7 — Sources, raw observations and inert briefings

Catalogue: `data/countries/andorra/tables/sources.json#/rows/2` (sheet Sources, source_row=712; SHA-256 `6d43c254e4316b41459ebe30bec3422495ef9ec2cfd73e1e576e89f55d7fd1d2`). Expected source fields:
```json
{
  "country_id": "andorra",
  "source_namespace": "country-package-andorra",
  "source_id": "andorra--S6550aa0914",
  "publisher": null,
  "title": "Government of Andorra: communal election 2023 results",
  "url": "https://www.eleccions.ad/resultats",
  "checked_as_of_label": "2026-09-08",
  "evidence_grade": "Official",
  "file_sha256": null,
  "locator": null,
  "data_rights": "unknown"
}
```

Raw poll source: `data/countries/andorra/tables/polling-evidence.json#/rows/0` (sheet Polling evidence, source_row=8; SHA-256 `38f381504737bbd9cabb078cb22be7ceae36a64fe05df181568a88048e0f0cca`). Its genuine AR+I PDF URL is source-links `/urls_without_master_source_row/0`, so create the deterministic inline source listed in Identity Vectors, with publisher/title/checked_as_of_label NULL. Poll sample 403 and distinct denominators n=195/n=275 survive original payload. Control row: `data/countries/andorra/tables/governing-control.json#/rows/0` (sheet Governing control, source_row=47; SHA-256 `fa0dcd8db2d960f0392cf887f42778a44a30a152775cb0f0b1e2e11aa81dcc81`); preserve dated observation and limitations in the Ctl input locator, not a new tenure claim.

Briefing retained_input shape (append common L/R; no raw_json column exists on retained_input):
```json
{
  "input_path": "data/countries/andorra/briefings/AD-M-05.html",
  "input_kind": "artifact",
  "sha256": "425543504f9c560a81613e7c912f4f461250f3e38db1f1bf2cd8e977fc946cff",
  "byte_count": 6682,
  "recovery_locator": "sha256:425543504f9c560a81613e7c912f4f461250f3e38db1f1bf2cd8e977fc946cff",
  "payload_json": null
}
```

Briefing crosswalk and typed input locator bind the exact artifact; parse external anchors inertly for evidence. Do not run HTML/scripts or overwrite detailed numeric shares with display text.

## Example 8 — Isolated missing-value and precision mutations (Not run)

Copy the input at Example 6's D `/rows/4/10` into a test-only workspace and replace 0 with null. Expected same bound result_row_id, seats=NULL, seats_status=unknown; votes/share unchanged. Fingerprint changes. This is not a source correction and must never be published as production research. Numeric value + unknown status or null + zero status must fail. Add analogous isolated votes/share zero/null probes because none of the baseline votes/shares is missing or zero.

For date precision, use Example 3's real HK as the owner in a test-only explicit identity-binding/date-claim case with supplied label `2019-12`. Expected research_date precision=month, year=2019, month=12, day=NULL; supplied certainty=conditional stays conditional. Retain original source claim; do not pretend the package supplies the test month. Invalid 2019-02-29 fails. Independent conflicting test claims for AD-M-05 next polling date stay separate research_date/evidence rows; office.next_date_id=NULL,next_date_resolution=conflicting,next_history_key=NULL while unresolved. No averaging/range or guessed winner.

## Example 9 — Genuine unresolved token versus broken resolved FK (Not run)

Origin is Example 2's real H `/rows/0/12` and target `(N,AD-M-05,AD-M-05::2023::2023-12-17)`. In an isolated test copy, replace the citation with explicit test token `TEST-UNMATCHED-CITATION`. Retain exact test-input hash/locator and original token in unresolved_evidence, reason=unmatched_catalogue_token; record_key points to the real event locator. No source row/URL/publisher is made. This token is a fixture for CI, not supplied Andorra research.

Separate poison case: leave the actual URL untouched and resolve it to andorra--S6550aa0914, then deliberately omit that known source row during staging after some writes. Expected nonzero import, FK failure, prior published rows/R/set still serving, durable failed attempt, successful_release_id=NULL. Relabelling this known source “unresolved” is prohibited. Repeat for dangling office/geography/event references.

## Example 10 — Incomplete refresh retaining an omitted office (Not run)

Use the real Canillo origin O `/rows/1` (AD-M-01), T `/classifications/1`, and H `/rows/3`, `/rows/4`, `/rows/5`; all source hashes/identities are listed in companion files. A later isolated incomplete refresh omits these rows and associated detail rows; it is not an authorized withdrawal.

If an actual previous successful Andorra publication exists, preserve AD-M-01, its three histories/results/sources/approved classification and every bound alias. New selected Andorra R includes inherited old file descriptors; typed provenance repoints consistently and raw retains old origin. Effective office count stays seven; tier union stays seven municipal. Conflicting old/new path bytes use inherited/sha256/<old_hash>/<original_path>. If there is no prior publication to inherit from, the reduced first import fails baseline equality; no invented office is reconstructed.

## Example 11 — Corrected hash and fixture exclusion (Not run)

The exact original source is D `/rows/0`, AD-M-05/2023 ENCLAR, with Example 2's values/ID. A future real correction must use a separately accepted atlas-override/1 record with its full target key, expected_original and evidence; no replacement vote/share is invented here. Future CI uses isolated marked test data, verifies changed content→new R, same bound result/event IDs, original claim recoverable, and full prior snapshot retained. Merely changing method_version in a hash-only probe yields the second digest in Identity Rules, without authorizing any source/semantic change.

Separate fixture probes replace a copy of O `/rows/0/0` with FIX-AD-M-05 or FXT-AD-M-05, or enable fixture provenance/namespace/payload. Production-path acceptance must reject before publication regardless of OBSERVATORY_FIXTURES. No fixture appears in published totals or retained production inputs. No baseline package ID starts with those prefixes.

## Example 12 — Publication set continuity and durable failure (Not run)

The candidate Andorra R is Example 1. Preserve whatever actually selected Albania/LatAm/NZ pairs exist in the starting master; do not invent their release hashes. Publication set changes only the Andorra member when Andorra inputs change. An unchanged Andorra re-import keeps its R too. Cite an existing non-Andorra row through its original `(lineage_id,release_id)`, not Andorra's receipt; semantic rows of all other lineages remain identical.

Stage same-FS from a consistent backup; exercise poison/busy WAL/fsync/rename/crash gates in the checklist. Started attempt remains durable outside staging. Pre-swap failure publishes no candidate release; post-swap ambiguity reconciles receipt before terminal ledger state. Expected successful publication_receipt is singleton=1, last_publish_attempt_id=actual new attempt, attempted_lineage_id=country-package-andorra, attempted_release_id=R. No success or operational timestamp is asserted by this documentation pack.
