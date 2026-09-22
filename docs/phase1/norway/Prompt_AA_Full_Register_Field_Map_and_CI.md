# Prompt AA — mapping and CI checklist

Pinned main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Research extraction/document checks are completed work; production/importer tests in this Prompt AA landing were **Not run**. Justin accepted 389 current + 537 historical draft offices on 2026-09-19 with named holds. The follow-up importer is `ATLAS_IMPORT_SCOPE=norway` — see [Norway_Import.md](Norway_Import.md). Standing scope policy is preserved.

| Requirement | Status | Pointer / gate |
| --- | --- | --- |
| Current and historical office register, source locators | **Done** | Report; office-register.json; current 389 + historical 537 |
| 357 current municipal councils and 14 county councils; Oslo bystyre once | **Done** | Register; Identity Rules; hold OSLO-BOROUGH-HISTORY |
| Stortinget / Sámediggi / 15 boroughs / Longyearbyen | **Done** | Report scope table; source catalogue |
| Appointed and reserved offices distinguished | **Done** | Report; no popular mayor/PM/cabinet or EP rows |
| Historic overlap, partial dates and missing ≠ zero | **Done** | Field Map projection; Identity Rules |
| Draft tiers exact 926 office coverage | **Done** | schemas/atlas/tiers/norway.json |
| Full 223 columns/20 tables | **Done** | Norway_Field_Map.md |
| Complete documentary identity vectors | **Done** | Norway_Identity_Vectors.json; acceptance-vectors.json |
| Out-of-window office retention | **Done** | Acceptance examples; standing policy |
| Named research holds documented | **Done** | Norway_Research_Gaps.md; research-gaps.json |
| >=15 worked acceptance examples | **Done** | Acceptance document; acceptance-vectors.json |
| Input, ZIP-member and output hashes | **Done** | Inventory; validation.json; SHA256SUMS |
| Sami 2025 zero-vote / one-seat conflict | **Open / HOLD** | SAMI-2025-ZERO-VOTE-SEAT-98d |
| 2020/2024 reform successor bindings | **Open / HOLD** | REFORM-2020-2024 |
| Oslo borough and Longyearbyen histories | **Open / HOLD** | OSLO-BOROUGH-HISTORY; LONGYEARBYEN-HISTORY |
| Legal certification / county aggregates / older Sami / municipal depth / party categories | **Open / HOLD** | LEGAL-STATUS-REPEATS; COUNTY-AGGREGATES; SAMI-OLDER-HISTORY; MUNICIPAL-HISTORY-DEPTH; PARTY-CATEGORIES |
| Justin register/tier acceptance | **Accepted 2026-09-19 with named holds** | 389 current + 537 historical; named holds stay open |
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

Candidate pack-draft tier SHA-256: `dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0`. Accepted landing tier SHA-256: `8ff8fc545ab326b135ac8a116d013c3dbecce377750e26dfc008bcea134db827`. Package validation and checksum results are in validation.json; execution rows above are not claimed run.

## Justin decisions — 2026-09-19

- [x] Accept 926 office identities and current 389 / historical 537 register.
- [x] Accept drafted geographic tiers for the register universe (876 municipal / 32 regional / 1 national / 17 other). Keep boroughs / Sámediggi / Longyearbyen as `other`; do not invent clearances.
- [x] Accept documentation for future implementation while retaining named research holds.
- [ ] Resolve SAMI-2025-ZERO-VOTE-SEAT-98d. **HOLD — preserve both zero-vote and one-seat claims.**
- [ ] Resolve REFORM-2020-2024. **HOLD — no invented successor links.**
- [ ] Resolve OSLO-BOROUGH-HISTORY and LONGYEARBYEN-HISTORY. **HOLD — result histories not acquired.**
- [ ] Resolve LEGAL-STATUS-REPEATS, COUNTY-AGGREGATES, SAMI-OLDER-HISTORY, MUNICIPAL-HISTORY-DEPTH, and PARTY-CATEGORIES. **HOLD — research notes stay open.**
- [ ] Authorize a future importer separately. **Not authorized in this landing.**

No checkbox is implied checked by Done in a mapping row. No DDL, approved other-country pack, Mexico override or Denmark/Netherlands/Switzerland file is changed. No `/electiondatabase` redirects.
