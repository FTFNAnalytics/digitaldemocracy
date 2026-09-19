# Prompt T — mapping and CI checklist

Pinned main `b293da99b97a8ae008d87ee2e57210cde0678004`. Research extraction/document checks are completed work; production/importer tests are **Not run**. Justin accepted all 432 current + 69 historical draft offices on 2026-09-19. **Importer / SQLite / VPS / UI applied_changes=0.** Standing scope policy is preserved.

| Requirement | Status | Pointer / gate |
|---|---|---|
| Current and historical office register, source locators | **Done** | Report; office-register.json; current 432+historical 69 |
| All 342 CBSmunicipal councils and 12 provinces | **Done** | Register; original XLSX rows 2–343 |
| Waterboards/chambers/EP/islands/colleges and identified submunicipal bodies | **Done** | Report scope table; source catalogue |
| Appointed and reserved offices distinguished | **Done** | Acceptance 3,7,18 |
| Historic overlap, partial dates and preliminary qualification | **Done** | Field Map projection; Acceptance 6,8,9 |
| Draft tiers exact 501 office coverage | **Done** | schemas/atlas/tiers/netherlands.json |
| Full 223 columns/20 tables | **Done** | Netherlands_Field_Map.md |
| Complete documentary identity vectors | **Done** | Netherlands_Identity_Vectors.json |
| Out-of-window office retention | **Done** | Acceptance 1,14 |
| Hilversum/Wijdemeren single merger watch | **Done** | U /0; Acceptance 10 |
| >=12 worked acceptance examples | **Done** | 19 examples in Acceptance document |
| Input, ZIP-member and output hashes | **Done** | Inventory; validation.json; SHA256SUMS |
| Nationwide audit of additional elected advisory bodies | **Open research** | Report scope caveat; no invented bodies |
| Certified totals/older merger and repeat histories | **Open research** | Report named gaps; source README qualifications |
| Justin register/tier acceptance | **Accepted 2026-09-19** | 432 current + 69 historical; focused-tier reviews and Hilversum/Wijdemeren stay open |
| Unchanged import/newattempt/sameR | **Not run** | Acceptance 13 |
| Correction/newR and incomplete refresh retention | **Not run** | Acceptance 13–14 |
| Poison rollback and durable attempt logging | **Not run** | Acceptance 15 |
| Broken resolved FK fails; intentional unresolved explicit | **Not run** | Acceptance 10–11 |
| Fixture rejection and namespace collision tests | **Not run** | Acceptance 15; Identity Rules |
| Missing/zero, partial date, weighted/unit semantics | **Not run** | Acceptance 4,6,7 |
| Tier-driven calendar including honest zero subset | **Not run** | Acceptance 5,17–18 |
| Other publication members/citations unchanged | **Not run** | Acceptance 16 |
| SQLite foreign keys/integrity/import | **Not run** | No SQLite execution |
| Same-FS/WAL/fsync/rename/crash recovery | **Not run** | Field Map Publication protocol |
| VPS/UI/redirects | **Not run** | Out of scope |

## Justin decisions — 2026-09-19

- [x] Accept 501 office identities and current 432/historical 69 register.
- [x] Accept drafted geographic tiers for the register universe. Keep ~147 focused-review flags; do not invent clearances.
- [ ] Resolve functional/submunicipal/EP/island and historical binding review categories. **HOLD — drafted tiers retained.**
- [x] Accept result-source qualifications; named historic gaps stay open.
- [ ] Resolve the single Hilversum/Wijdemeren merger successor binding. **HOLD — research note stays open.**
- [ ] Authorize a future importer separately. **Not authorized in this landing.**

No checkbox is implied checked by Done in a mapping row. No DDL, approved other-country pack, Mexico override or Belgium file is changed. No `/electiondatabase` redirects.
