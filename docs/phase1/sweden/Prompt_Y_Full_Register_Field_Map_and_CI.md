# Prompt Y — mapping and CI checklist

Pinned main `94b22e8662b4d304263bef67628765f5377fd9da`. Research extraction/document checks are completed work; production/importer tests are **Not run**. Justin accepted 313 current + 7 historical draft offices on 2026-09-19 with named holds. **Importer / SQLite / VPS / UI applied_changes=0.** Standing scope policy is preserved.

| Requirement | Status | Pointer / gate |
| --- | --- | --- |
| Current and historical office register, source locators | **Done** | Report; office-register.json; current 313 + historical 7 |
| Kommunfullmäktige including Gotland once | **Done** | Register; Identity Rules; hold SE-GOTLAND-TIER |
| Riksdagen / EP / Sameting / former landsting | **Done** | Report scope table; source catalogue |
| Appointed and reserved offices distinguished | **Done** | Report; no popular kommunalråd/PM/cabinet rows |
| Historic overlap, partial dates and preliminary qualification | **Done** | Field Map projection; Identity Rules |
| Draft tiers exact 320 office coverage | **Done** | schemas/atlas/tiers/sweden.json |
| Full 223 columns/20 tables | **Done** | Sweden_Field_Map.md |
| Complete documentary identity vectors | **Done** | Sweden_Identity_Vectors.json; acceptance-vectors.json |
| Out-of-window office retention | **Done** | Acceptance examples; standing policy |
| Named research holds documented | **Done** | Report named gates; research-gaps.json |
| >=15 worked acceptance examples | **Done** | Acceptance document; acceptance-vectors.json |
| Input, ZIP-member and output hashes | **Done** | Inventory; validation.json; SHA256SUMS |
| Gotland municipal / EP+Sameting other | **Open / HOLD** | SE-GOTLAND-TIER; SE-EP-SAM-TIER |
| 2026 local count refresh | **Open / HOLD** | SE-2026-COUNT-IN-PROGRESS; 310 preliminary |
| Historic boundaries / party detail / repeats | **Open / HOLD** | SE-HISTORICAL-BOUNDARIES; SE-HISTORIC-PARTY-DETAIL; SE-REPEAT-AND-RECOUNT |
| Färgelanda 1973 withheld seats | **Open / HOLD** | SE-FARGELANDA-1973 |
| Justin register/tier acceptance | **Accepted 2026-09-19 with named holds** | 313 current + 7 historical; named holds stay open |
| Unchanged import/newattempt/sameR | **Not run** | Acceptance 16 |
| Correction/newR and incomplete refresh retention | **Not run** | Acceptance 17–18 |
| Poison rollback and durable attempt logging | **Not run** | Acceptance 17; ledger outside discarded staging |
| Broken resolved FK fails; intentional unresolved explicit | **Not run** | Acceptance 15 |
| Fixture rejection and namespace collision tests | **Not run** | Acceptance 19 |
| Missing/zero, partial date, weighted/unit semantics | **Not run** | Acceptance 8–10 |
| Tier-driven calendar including honest zero subset | **Not run** | Field Map classification table |
| Other publication members/citations unchanged | **Not run** | Identity Rules publication protocol |
| SQLite foreign keys/integrity/import | **Not run** | No SQLite execution |
| Same-FS/WAL/fsync/rename/crash recovery | **Not run** | Identity Rules publication protocol |
| VPS/UI/redirects | **Not run** | Out of scope |

Candidate pack-draft tier SHA-256: `ba95b2671f56b45077e9a4987e54d59438793cdfe053d8486de04dc54c0f2139`. Accepted landing tier SHA-256: `dc13885023d2d454dae39272a5fe668e384e7606d4f2f89a3df136e9f0170ef7`. Package validation and checksum results are in validation.json; execution rows above are not claimed run.

## Justin decisions — 2026-09-19

- [x] Accept 320 office identities and current 313 / historical 7 register.
- [x] Accept drafted geographic tiers for the register universe (292 municipal / 25 regional / 1 national / 2 other). Keep focused-review flags; do not invent clearances.
- [x] Accept documentation for future implementation while retaining named research holds.
- [ ] Resolve SE-GOTLAND-TIER. **HOLD — keep municipal `SE-K0980-C`; do not add a second regional office.**
- [ ] Resolve SE-EP-SAM-TIER. **HOLD — EP and Sameting stay `other`.**
- [ ] Resolve SE-2026-COUNT-IN-PROGRESS. **HOLD — 310 local 2026 vectors remain preliminary.**
- [ ] Resolve SE-HISTORICAL-BOUNDARIES, SE-HISTORIC-PARTY-DETAIL, SE-REPEAT-AND-RECOUNT, and SE-FARGELANDA-1973. **HOLD — research notes stay open.**
- [ ] Authorize a future importer separately. **Not authorized in this landing.**

No checkbox is implied checked by Done in a mapping row. No DDL, approved other-country pack, Mexico override or Belgium/Netherlands/Switzerland/Denmark file is changed. No `/electiondatabase` redirects.
