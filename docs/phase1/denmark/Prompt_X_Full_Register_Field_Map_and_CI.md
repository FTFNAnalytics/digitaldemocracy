# Prompt X — mapping and CI checklist

Pinned main `e64afc324e34ae07f0760f49870ece64eb2ee645`. Research extraction/document checks are completed work; production/importer tests in this Prompt X landing were **Not run**. Justin accepted all 106 current + 240 historical draft offices on 2026-09-19. The follow-up importer is `ATLAS_IMPORT_SCOPE=denmark` — see [Denmark_Import.md](Denmark_Import.md). Standing scope policy is preserved.

| Requirement | Status | Pointer / gate |
| --- | --- | --- |
| Current and historical office register, source locators | **Done** | Report; office-register.json; current 106 + historical 240 |
| All 98 municipal councils and regional transition | **Done** | Register; Identity Rules municipal reform section |
| Folketinget / EP / former county councils | **Done** | Report scope table; source catalogue |
| Appointed and reserved offices distinguished | **Done** | Report; Examples 9; no popular mayor rows |
| Historic overlap, partial dates and preliminary qualification | **Done** | Field Map projection; Identity Rules |
| Draft tiers exact 346 office coverage | **Done** | schemas/atlas/tiers/denmark.json |
| Full 223 columns/20 tables | **Done** | Denmark_Field_Map.md |
| Complete documentary identity vectors | **Done** | Denmark_Identity_Vectors.json |
| Out-of-window office retention | **Done** | Acceptance 1 |
| Realm/merger/feed gaps documented | **Done** | Report named gates; research-gaps.json |
| >=12 worked acceptance examples | **Done** | 20 examples in Acceptance document |
| Input, ZIP-member and output hashes | **Done** | Inventory; validation.json; SHA256SUMS |
| Greenland/Faroe clean registers | **Open research** | research-gaps.json; no invented offices |
| Merger legal successor/boundary completeness | **Open research** | identity-crosswalk.json; Report |
| KMD/DST detail holes | **Open research** | Report; source cubes retained |
| 98 older candidate-name bindings | **Open research** | unresolved-candidate-bindings.json |
| EP seats / candidate histories | **Open research** | Report; year-precision events retained |
| Justin register/tier acceptance | **Accepted 2026-09-19** | 106 current + 240 historical; focused-tier reviews and named gates stay open |
| Unchanged import/newattempt/sameR | **Not run** | Acceptance 16 |
| Correction/newR and incomplete refresh retention | **Not run** | Acceptance 17, 19 |
| Poison rollback and durable attempt logging | **Not run** | Acceptance 18 |
| Broken resolved FK fails; intentional unresolved explicit | **Not run** | Acceptance 14–15 |
| Fixture rejection and namespace collision tests | **Not run** | Acceptance 20; Identity Rules |
| Missing/zero, partial date, weighted/unit semantics | **Not run** | Acceptance 8 |
| Tier-driven calendar including honest zero subset | **Not run** | Field Map classification table |
| Other publication members/citations unchanged | **Not run** | Identity Rules publication protocol |
| SQLite foreign keys/integrity/import | **Not run** | No SQLite execution |
| Same-FS/WAL/fsync/rename/crash recovery | **Not run** | Identity Rules publication protocol |
| VPS/UI/redirects | **Not run** | Out of scope |

## Justin decisions — 2026-09-19

- [x] Accept 346 office identities and current 106 / historical 240 register.
- [x] Accept drafted geographic tiers for the register universe. Keep 293 focused-review flags; do not invent clearances.
- [x] Accept documentation for future implementation while retaining named research gates.
- [ ] Resolve Greenland/Faroe Realm coverage. **HOLD — do not invent Greenland/Faroe offices.**
- [ ] Resolve 2007/earlier merger successor bindings. **HOLD — do not fabricate merger clearances.**
- [ ] Resolve KMD/DST detail holes, 98 candidate bindings, and EP detail gaps. **HOLD — research notes stay open.**
- [ ] Authorize a future importer separately. **Not authorized in this landing.**

No checkbox is implied checked by Done in a mapping row. No DDL, approved other-country pack, Mexico override or Belgium/Netherlands/Switzerland file is changed. No `/electiondatabase` redirects.
