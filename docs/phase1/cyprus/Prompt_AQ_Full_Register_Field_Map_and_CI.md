# Prompt AQ — field map and CI checklist

Mapping work is documented for the supplied research projection; holds CY-G01–CY-G15 remain open. Justin accepted the pack with those holds on 2026-09-22. The importer is `ATLAS_IMPORT_SCOPE=cyprus` only — see [Cyprus_Import.md](Cyprus_Import.md). `all` does not publish Cyprus.

| Item | Status | Pointer |
|---|---|---|
| Current source roster: 20 municipal councils + 20 mayors + 93 deputies + 285 community councils + 285 community leaders + 5 DLGO presidents + House + President + 3 religious representatives + EP | Done | JUSTIN_REPORT / office-register / Identity Rules |
| 174 historical municipal and community identities; empty successor crosswalk | Done | successor-crosswalk.json / CY-G03 |
| 285 named communities versus ministry overview 286; no 286th row | Done | communities.json / CY-G01 |
| Spilia Agios Antonios and Spilia Kourdali kept separate | Done | CY-COM-1401 / CY-COM-SPILIA-KOURDALI / CY-G04 |
| Draft tiers exact 1:1 with the register | Done | `schemas/atlas/tiers/cyprus.json` / draft-tiers.json |
| No TRNC offices and no occupied-community local offices | Done | CY-G02 / Identity Rules |
| No zero-filled missing local returns | Done | CY-G11 / extraction-issues.json |
| 223 destination fields | Done | Cyprus_Field_Map.md / field-map-223.json / contracts/columns.json |
| Acceptance examples | Done | Cyprus_Acceptance_Examples.md |
| Source inventory and full-pack hash manifest | Done | source-inventory.json / SHA256SUMS |
| Offline validator | Done | validate.py / validation.json (pre-acceptance PASS) |
| Justin accept-with-holds receipt | Done | JUSTIN_ACCEPTANCE.md |
| Importer / publication CI | Landed | `ATLAS_IMPORT_SCOPE=cyprus` only; not part of `all`. 0 result rows. See [Cyprus_Import.md](Cyprus_Import.md). VPS deploy was not run |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Actual unchanged re-import creates new durable attempt and same lineage release | Not run |
| Tier file is sole classifier; calendar cohorts excluded | Not run |
| Missing/zero and year-only dates preserved | Not run |
| Country and district views, and candidate preferences, are not added to list totals | Not run |
| Unopposed returns stay no_poll, not a fictional electorate or zero popular votes | Not run |
| The 286th free-area community, TRNC offices, 2024 successor edges, and the Spilia code join stay unresolved | Not run |
| Other country lineages unchanged | Not run |
| No office/history filtering by upcoming 18-month window | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin approves draft tiers as accepted-with-holds (no per-office `review_status` flip).
- [x] Justin authorizes implementation (`ATLAS_IMPORT_SCOPE=cyprus`; not part of `all`).
