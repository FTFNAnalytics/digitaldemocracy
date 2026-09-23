# Prompt AH — Lithuania field map and CI checklist

**Draft for Justin; no production acceptance.** Mapping completion is not research completeness or importer acceptance. Main pin: `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33`.

## Mapping work

| Requirement | Status | Review pointer |
|---|---|---|
| Current roster and explicit missing histories | Done | Lithuania_Full_Register_Report.md; office-register.json; counts.json |
| Council/direct-mayor separation and direct presidency | Done | Field Map: source extraction; Identity Rules: entity table |
| All 20 destination tables and 223 columns | Done | Lithuania_Field_Map.md; column-map.json; contract-columns.json |
| Exact tier coverage and draft status | Done | schemas/atlas/tiers/lithuania.json; human-review.json |
| Deterministic office, event, result, source and geography IDs | Done | Lithuania_Identity_Rules.md; Lithuania_Identity_Vectors.json |
| Fingerprint, release, attempt and publication ownership | Done | Identity Rules: release identity and attempts |
| Partial dates and unknown next-election fields | Done | Field Map: research_date and office; examples 2, 8, 10 |
| Missing versus zero and approximate values | Done | Field Map: result_row; examples 6, 7, 9 |
| Rounds, mixed electoral system and overlapping sources | Done | Field Map: source extraction; examples 4, 11 |
| Evidence, unresolved claims and broken foreign keys | Done | Field Map: source, evidence_link, unresolved_evidence; example 18 |
| Historical territorial holds and incomplete refresh | Done | Research Gaps: LT-TERRITORIAL-ID; examples 15, 20 |
| At least 15 worked examples | Done | Lithuania_Acceptance_Examples.md contains 21 |
| Retained source hashes and inventory | Done | Lithuania_Input_Inventory.json; SHA256SUMS |
| Read-only pack validation | Done | validation.json; validate.py |
| All approval boxes unchecked | Done | README.md; tier approval object |

## Future importer and publication gates

| Gate | Execution status | Required assertion |
|---|---|---|
| Accepted tiers | Not run | A draft tier file cannot publish before Justin accepts it; exact office ID equality is required. |
| Unchanged re-import | Not run | Same release ID, new attempt ID; stable row counts and entity identities. |
| Corrected release | Not run | An accepted, guarded effective-input change alters the release fingerprint, not unaffected entity IDs. |
| Failed-import rollback | Not run | Broken references, invalid scalar domains and fixtures abort staging; the last good publication remains available. |
| Durable attempt ledger | Not run | Record start/failure outside staging so failed staging cannot erase the audit trail. |
| Missing versus zero | Not run | Distinguish NULL/unknown from 0/zero; do not infer votes, seats or a seat from a winner flag. |
| Date precision | Not run | Preserve year/month/day precision independently of certainty; never invent a day. |
| Resolved references | Not run | Enforce full source and entity foreign keys; retain unresolved tokens explicitly. |
| Fixture exclusion | Not run | Reject test identities from production effective inputs. |
| Council, mayor and round identities | Not run | Preserve 60 council/mayor pairs; no appointed executives or duplicate cycle events for rounds. |
| Incomplete refresh | Not run | Omission does not delete current or historical identities. |
| Conflict handling | Not run | Presidential percentages remain disputed; no automatic alternate or certification. |
| Other lineages | Not run | Preserve LatAm, NZ and other Europe rows, releases and citation ownership. |
| Atomic publication | Not run | Same-filesystem staging, WAL checkpoint, durable filesystem flush and atomic rename; failure preserves the last good publication. |
| SQLite/importer/VPS/UI | Not run | No implementation, database load, deployment or UI work performed. |

- [ ] Justin accepts the current register with named holds.
- [ ] Justin accepts the proposed tiers.
- [ ] Justin authorizes a later importer task.

`applied_changes=0` for repository/importer/SQLite/VPS/UI.
