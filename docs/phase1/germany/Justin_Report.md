# Justin review report — Germany / Prompt AS

**Research handoff, incomplete coverage, not approved for implementation.** `applied_changes=0`; production/importer/SQLite/VPS/UI/repository changes: 0. All approvals below remain unchecked.

| Measure | Count |
|---|---:|
| Current offices | 21,960 |
| Historical-only office/code identities | 670 |
| Election event / ballot versions | 13,845 |
| Reporting units | 47,762 |
| Result records, including metrics and seat rows | 1,299,670 |
| Current direct executives | 9,585 |
| Current local councils / elected assemblies | 12,356 |
| All current collective elected bodies, including Land/BT/EP | 12,374 |
| Indirect presidential office | 1 |
| Territorial municipalities | 10,747 |
| Municipal council offices | 10,718 |
| Kreis councils | 294 |
| Land parliaments | 16 |
| Federal offices, Bundestag + Bundespräsident | 2 |
| EP delegation offices | 1 |
| Association councils / direct association executives | 262 / 262 |
| Other Bezirk / regional / borough / Ortschaft / inhabitants’ bodies | 1,082 |
| Retained source files | 5073 |
| Field mappings / acceptance examples | 223 / 51 |

Draft tiers: Tier 1: 3, Tier 2: 20, Tier 3: 552, Tier 4: 22,055.

Full required pack structure is supplied. Scope completeness remains false. The territorial core covers all 10,747 current municipality records and all 401 Kreis-level units at the retained vintage, with legal elected-body exceptions. The direct-executive roster is not complete in SH; optional elected submunicipal bodies need further Land/local rosters. Local history is selective. Historic-code retention does not assert abolition or succession.

Bundespräsident is indirect; Bundesrat has no popular office/return. Land executives are not invented as popular offices. NI member mayors and BW/SH Landräte are excluded from direct executives. First/second Bundestag votes, convention ballots, local multi-vote totals, Saxon second ballots and Bavarian weighted figures remain distinct. Current Bundestag allocation law is not imposed on older elections.

Source conflicts are visible: Berlin's 2026-labelled exports contain 2021 dates; Hamburg’s conflicting heading is now independently resolved; MV 2026 preliminary totals were recovered. Fifteen Land seat panels remain numerically inconsistent; Bavaria 1950 party labels and two RP candidate-identity returns are gated. Missing labels and values remain unresolved. No votes, seats, exact dates or successor links were fabricated to fill these gaps.

The delivered validator checks source/manifest hashes, foreign keys, the 223-column map, one tier per office, mechanism exclusions, result-status distinctions, source arithmetic and negative controls. Its captured report must be read with the open research gates; it is not a complete legal audit.

- [ ] Justin approves the current office register and its outstanding scope gates.
- [ ] Justin approves every draft tier.
- [ ] Justin approves the historic events/results and status distinctions.
- [ ] Justin approves the identity and succession rules.
- [ ] Justin approves the 223-column documentary field map.
- [ ] Justin accepts or resolves the named research gaps.
- [ ] Justin separately authorizes any implementation.
- [ ] Justin separately authorizes any publication or deployment.

No approval is implied by file delivery, a hash match or a passing validator.
