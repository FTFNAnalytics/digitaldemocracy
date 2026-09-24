# Prompt AP — field map and CI checklist

Mapping work is documented for the supplied research projection; the gates in `Malta_Research_Gaps.md` remain open. Justin accepted the pack with those holds on 2026-09-22. The importer is `ATLAS_IMPORT_SCOPE=malta` only — see [Malta_Import.md](Malta_Import.md). `all` does not publish Malta.

| Item | Status | Pointer |
|---|---|---|
| Current source roster: 68 councils + 68 mayors + 68 deputies + 6 regional presidents + House + President + EP | Done | JUSTIN_REPORT / office-register / Identity Rules |
| 2 historical Gozo Civic Council identities; empty successor crosswalk | Done | successor-crosswalk.json / territorial-gates.json |
| Draft tiers exact 1:1 with the register | Done | `schemas/atlas/tiers/malta.json` / draft-tiers.json |
| No popular presidential or mayor ballot | Done | Identity Rules / Acceptance examples / `standalone_popular_executive_ballot=false` |
| President remains indirect House resolution | Done | `MT-PRESIDENT` |
| 223 destination fields | Done | Malta_Field_Map.md / field-map-223.json / contracts/columns.json |
| Acceptance examples | Done | Malta_Acceptance_Examples.md |
| Source inventory and full-pack hash manifest | Done | source-inventory.json / SHA256SUMS |
| Offline validator | Done | validate.py / validation.json (pre-acceptance PASS) |
| Justin accept-with-holds receipt | Done | JUSTIN_ACCEPTANCE.md |
| Importer / publication CI | Landed | `ATLAS_IMPORT_SCOPE=malta` only; not part of `all`. 0 result rows. See [Malta_Import.md](Malta_Import.md) |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Actual unchanged re-import creates new durable attempt and same lineage release | Not run |
| Tier file is sole classifier; calendar cohorts excluded | Not run |
| Missing/zero and year-only dates preserved | Not run |
| STV count observations are not added to first-preference result rows | Not run |
| Paper-level transfers and House division tallies stay uncollected | Not run |
| Sole-nominee regional nominations stay nominations | Not run |
| Other country lineages unchanged | Not run |
| No office/history filtering by upcoming 18-month window | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin approves draft tiers as accepted-with-holds (no per-office `review_status` flip).
- [x] Justin authorizes implementation (`ATLAS_IMPORT_SCOPE=malta`; not part of `all`).
