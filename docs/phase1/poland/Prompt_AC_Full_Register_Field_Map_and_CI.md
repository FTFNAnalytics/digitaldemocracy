# Prompt AC — mapping and future CI checklist

Draft; main `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. Artifact validation does not mean importer/SQLite/publication execution.

| Mapping deliverable | Status | Evidence |
|---|---|---|
| Pin and unchanged authoritative contracts | Done | Poland_Input_Inventory.json /pinned_main; contracts/ |
| Complete current requested elected-body universe | Done | data/research/poland/territorial-reconciliation.json |
| Historical offices and named missing archives | Done | Poland_Research_Gaps.md; historic-territory-research-queue.json |
| Separate direct executive/council and city-county rules | Done | Poland_Identity_Rules.md; office-register.json |
| Draft tiers exact1:1 | Done | schemas/atlas/tiers/poland.json |
| All223 destination columns | Done | Poland_Field_Map.md; column-map.json |
| Exact identities and complete vectors | Done | Poland_Identity_Vectors.json; result-identity-vectors.jsonl.gz |
| Round/aggregate overlap and result source bindings | Done | source-row-audit.json; proceedings.json |
| Missing/zero, ambiguous shares and partial dates | Done | Poland_Acceptance_Examples.md examples8–14 |
| Source bytes/hashes and fingerprint | Done | Poland_Input_Inventory.json |
| At least15 worked examples | Done | Poland_Acceptance_Examples.md (22) |
| Named gaps and unchecked Justin decisions | Done | Poland_Research_Gaps.md; README.md |
| Artifact validator and checksums | Done | validate_pack.py; validation.json; SHA256SUMS |

| Importer/publication gate | Execution status | Required assertion |
|---|---|---|
| Unchanged re-import | Done | same effective bytes→same R and record/date IDs, new attempt_id |
| Corrected import | Not run | new accepted source/override/tier bytes→new R, original claims auditable |
| Poison rollback | Not run | last good publication served; failure in external durable ledger |
| Broken resolved refs | Not run | office/event/geography/source FK failures reject staging |
| Unresolved tokens | Done | 12 named holds stored as unresolved evidence; no fabricated source FK |
| Missing≠zero | Not run | NULL/status and numeric0/status remain distinct |
| Date precision/certainty | Done | day/year remain sourced; 2019 and 2029 stay year precision with null month/day |
| Round binding | Done | 9,773 proceedings; runoff does not supersede the first round; result bytes omitted |
| Tier acceptance | Done | approved poland.json drives tier; powiat stays regional (PL-POWIAT-TIER open) |
| Registry equality | Done | 5,312 offices match the accepted tier file |
| Incomplete refresh | Not run | carry omitted office/history/source or fail; never automatic deletion |
| Fixture exclusion | Done | FIX-/FXT-/OBSERVATORY_FIXTURES rejected |
| Multi-lineage citations | Done | Albania rows survive a Poland import; each record cites country-package-poland |
| Publication filesystem | Not run | consistent backup, same-FS staging, WAL checkpoint/close/fsync, atomic rename |
| Production importer/SQLite/VPS/UI | Not run | VPS, redirects, and cutover remain untouched |

- [ ] Justin accepts the register and named holds.
- [ ] Justin approves/amends draft tiers.
- [ ] Justin authorizes future implementation separately.
