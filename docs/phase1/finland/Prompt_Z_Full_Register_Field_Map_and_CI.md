# Prompt Z — mapping and CI checklist

Pinned main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Research extraction/document checks are completed work; production/importer tests in this Prompt Z landing were **Not run**. Justin accepted 333 current + 170 historical draft offices on 2026-09-19 with named holds. The follow-up importer is `ATLAS_IMPORT_SCOPE=finland` — see [Finland_Import.md](Finland_Import.md). Standing scope policy is preserved. Named holds stay open.

| Requirement | Status | Pointer / gate |
| --- | --- | --- |
| Current and historical office register, source locators | **Done** | Report; office-register.json; current 333 + historical 170 |
| 308 current municipal councils including 16 Åland; Helsinki once | **Done** | Register; Identity Rules; hold FI-ALAND-EARLY-AND-DATES |
| Eduskunta / presidency / EP / Lagting / wellbeing counties | **Done** | Report scope table; source catalogue |
| Appointed and reserved offices distinguished | **Done** | Report; no popular manager/PM/cabinet rows |
| Historic overlap, partial dates and missing ≠ zero | **Done** | Field Map projection; Identity Rules |
| Draft tiers exact 503 office coverage | **Done** | schemas/atlas/tiers/finland.json |
| Full 223 columns/20 tables | **Done** | Finland_Field_Map.md |
| Complete documentary identity vectors | **Done** | Finland_Identity_Vectors.json; acceptance-vectors.json |
| Out-of-window office retention | **Done** | Acceptance examples; standing policy |
| Named research holds documented | **Done** | Finland_Research_Gaps.md; research-gaps.json |
| >=15 worked acceptance examples | **Done** | Acceptance document; acceptance-vectors.json |
| Input, ZIP-member and output hashes | **Done** | Inventory; validation.json; SHA256SUMS |
| Historic mergers / same-code predecessors | **Open / HOLD** | FI-HISTORIC-MERGERS |
| Early Åland coverage and dates | **Open / HOLD** | FI-ALAND-EARLY-AND-DATES |
| Wellbeing-county 2022/2023 transition | **Open / HOLD** | FI-WELLBEING-TRANSITION |
| EP elected-member detail | **Open / HOLD** | FI-EP-DETAIL; EP stays `other` |
| Cycle legal chronology / party categories / missing results | **Open / HOLD** | FI-CYCLE-LEGAL-DETAIL; FI-PARTY-CATEGORIES; FI-MISSING-RESULTS |
| Justin register/tier acceptance | **Accepted 2026-09-19 with named holds** | 333 current + 170 historical; named holds stay open |
| Unchanged import/newattempt/sameR | **Not run** | Acceptance examples |
| Correction/newR and incomplete refresh retention | **Not run** | Acceptance examples |
| Poison rollback and durable attempt logging | **Not run** | Ledger outside discarded staging |
| Broken resolved FK fails; intentional unresolved explicit | **Not run** | Acceptance examples |
| Fixture rejection and namespace collision tests | **Not run** | Acceptance examples |
| Missing/zero, partial date, weighted/unit semantics | **Not run** | Acceptance examples |
| Other publication members/citations unchanged | **Not run** | Identity Rules publication protocol |
| SQLite foreign keys/integrity/import | **Not run** | No SQLite execution |
| Same-FS/WAL/fsync/rename/crash recovery | **Not run** | Identity Rules publication protocol |
| VPS/UI/redirects | **Not run** | Out of scope |

Candidate pack-draft tier SHA-256: `7c3a4c1c17538d5600a10c655e7fb18b12f977a1ef79c7608f9869d813df2797`. Accepted landing tier SHA-256: `15edd48df39caae6cfefec9b20b0a20a7bafcfe7e919accbb46d056924083d53`. Package validation and checksum results are in validation.json; execution rows above are not claimed run.

## Justin decisions — 2026-09-19

- [x] Accept 503 office identities and current 333 / historical 170 register.
- [x] Accept drafted geographic tiers for the register universe (478 municipal / 22 regional / 2 national / 1 other). Keep FI-EP as `other`; do not invent clearances.
- [x] Accept documentation for future implementation while retaining named research holds.
- [ ] Resolve FI-HISTORIC-MERGERS. **HOLD — no successor edges or same-code predecessor splits.**
- [ ] Resolve FI-ALAND-EARLY-AND-DATES. **HOLD — exact days, specials, and next Åland dates unverified.**
- [ ] Resolve FI-WELLBEING-TRANSITION. **HOLD — 2023 service start is not a new election; no inferred Kainuu predecessor.**
- [ ] Resolve FI-EP-DETAIL. **HOLD — EP stays `other`; do not manufacture seat totals.**
- [ ] Resolve FI-CYCLE-LEGAL-DETAIL, FI-PARTY-CATEGORIES, and FI-MISSING-RESULTS. **HOLD — research notes stay open.**
- [ ] Authorize a future importer separately. **Not authorized in this landing.**

No checkbox is implied checked by Done in a mapping row. No DDL, approved other-country pack, Mexico override or Denmark/Netherlands/Switzerland file is changed. No `/electiondatabase` redirects.
