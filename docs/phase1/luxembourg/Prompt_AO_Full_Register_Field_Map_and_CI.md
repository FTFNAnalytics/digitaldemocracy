# Prompt AO — field map and CI checklist

Mapping work is documented for the supplied research projection; research holds LU-G03–LU-G11 remain open. Justin accepted the pack with those holds on 2026-09-22. No importer was run.

| Item | Status | Pointer |
|---|---|---|
| Current source roster: 100 communal councils + parliament + EP | Done | JUSTIN_REPORT / office-register / Identity Rules |
| 28 historical communal identities with explicit merger edges | Done | merger-crosswalk.json / LU-G03 |
| Draft tiers exact 1:1 with the register | Done | `schemas/atlas/tiers/luxembourg.json` / draft-tiers.json |
| No Grand Duke or mayor popular office | Done | LU-G01 / LU-G02 / Acceptance Examples 3–4 |
| No regional elected offices | Done | Acceptance Example 2 |
| 223 destination fields / 20 tables | Done | Luxembourg_Field_Map.md / field-map-223.json / contracts/columns.json |
| 30 worked examples | Done | Luxembourg_Acceptance_Examples.md |
| Source inventory and full-pack hash manifest | Done | source-inventory.json / SHA256SUMS |
| Offline validator | Done | validate.py / validation.json (pre-acceptance PASS) |
| Justin accept-with-holds receipt | Done | JUSTIN_ACCEPTANCE.md |
| Importer, SQLite, VPS, UI | Not run | No `lib/atlas/luxembourg/` |

## Future importer/publication gates

| Gate | Execution status |
|---|---|
| Actual unchanged re-import creates new durable attempt and same lineage release | Not run |
| Tier file is sole classifier; calendar cohorts excluded | Not run |
| Missing/zero and year-only dates preserved | Not run |
| Candidate votes are not added to list totals; national and constituent observations are not summed | Not run |
| Uncontested raw zeros stay not_applicable_uncontested | Not run |
| 1994 Grevenmacher LSAP omission stays missing | Not run |
| Other country lineages unchanged | Not run |
| No office/history filtering by upcoming 18-month window | Not run |

- [x] Justin accepts this handoff with named holds (2026-09-22).
- [x] Justin approves draft tiers as accepted-with-holds (no per-office `review_status` flip).
- [ ] Justin authorizes implementation.
