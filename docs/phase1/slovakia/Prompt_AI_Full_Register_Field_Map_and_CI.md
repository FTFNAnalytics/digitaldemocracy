# Prompt AI — Slovakia mapping and future CI checklist

Draft only. Documentation and research validation do not execute the Atlas importer. All approvals remain unchecked.

| Mapping work | Status | Evidence |
|---|---|---|
| Main pin and unchanged223-column DDL contract | Done | Input inventory; contract-reference; field map |
| Full current elected roster / scope exclusions | Done | Register;2022–2026 source reconciliation; report |
| Historical cycles, returns and named depth gaps | Done | Events/results/proceedings; report depth table; research-gaps |
| Direct mayors/VUC chairs vs councils | Done | Separate source-grounded office IDs; law locators |
| Draft tiers exact 1:1; no calendar classifier | Done | schemas/atlas/tiers/slovakia.json; human-review |
| Identity, namespaced keys, source aliases, homonyms | Done | Identity Rules; complete Identity Vectors;2014-name-bindings |
| Every destination table/column; null/raw policies | Done | Field Map; column-map.json:20 tables223 columns |
| Source retention, hashes and member provenance | Done | Input Inventory; source-projection |
| ≥15 worked examples | Done |18 Acceptance Examples |
| Missing vs zero, rounds, election absence, partial dates | Done | Examples; source-grain notes; research-gaps |
| Research-only package validation | Done | validation.json; validate_pack.py |

| Future implementation / publication gate | Execution status | Required assertion |
|---|---|---|
| Importer, SQLite, VPS, UI | Not run | No execution in this pack |
| Tier approval gate | Not run | Reject production use of unaccepted draft;79 focused rows reviewed |
| Unchanged re-import | Not run | New durable attempt_id, same lineage release_id |
| Corrected source/override | Not run | Exact expected_original guard; new release; stable reviewed identities |
| Incomplete refresh | Not run | Omitted offices/history retained with effective inherited hashes |
| Source FK poison | Not run | Rollback staging; durable failure logged; last good serving |
| Unresolved citations | Not run | Exact token/locator retained; never fabricate resolved source FK |
| Missing vs zero | Not run | NULL/unknown stays distinct from printed0/zero |
| Date precision / conflicts | Not run | Partial labels never day-coerced; conflicting pointer withheld |
| Round fidelity | Not run | First/runoff one cycle;19 proceedings; no fabricated certification |
| Candidate grain / duplicate sources | Not run | Elected-only not complete; national vs local/precinct totals not summed |
| Homonym / revised source binding | Not run | Distinct source-record IDs; revised ordering requires accepted crosswalk |
| Fixture exclusion | Not run | Reject FIX-/FXT- and semantic fixture markers, including raw fields |
| Full FK / JSON refs / integrity | Not run | Validate all namespaces, parents, evidence and raw semantic references |
| Multi-lineage coexistence | Not run | Slovakia update leaves other release IDs, rows and citations unchanged |
| Same-FS publication | Not run | Durable attempt ledger; backup, WAL checkpoint/close, fsync, atomic rename |
| Crash recovery / rollback / restore | Not run | Reconcile receipt and ledger; interrupted candidate never masquerades as success |
| Regional calendar | Not run | Draft16 regional offices excluded until approval; no positive-minimum gate |
| Historic predecessor refresh | Not run | Sourced historical bodies retained; no inferred merger edges |

## Justin approval

- [ ] Accept research handoff.
- [ ] Accept/amend focused tier policy.
- [ ] Approve production tier bytes in a separate explicit action.
- [ ] Authorize importer/publication work separately.
