# Prompt AG field-map and CI checklist — DRAFT

Documentation/package checks are separate from future importer execution. All Justin approval boxes remain unchecked. Drafts and unresolved identity/percentage holds do not authorize publication.

| Mapping deliverable | Status | Evidence |
|---|---|---|
| Current main pin and immutable contracts | Done | Input Inventory; contract-reference |
| Full current42 council roster +3 national/supranational bodies | Done | office-register; Report |
|119 pre-reform snapshot identities retained, no false abolished-count claim | Done | Identity Rules; LV-G01 |
|2021 main/delayed/Riga and 2025 rosters distinguished | Done | register-source-rows; Examples4–6 |
| Draft tier exact1:1 set | Done | schemas/atlas/tiers/latvia.json |
|223 destination columns /20 tables | Done | Field Map; column-map; contract-columns |
| Complete documentary ID vectors | Done | Latvia_Identity_Vectors.json |
| List/precinct/candidate overlap, missing vs0 | Done | Field Map; Examples7–8,16 |
| President indirect, real ballot sequence/date precision | Done | Examples9–11; proceedings |
| Seven 2022 share conflicts retain both claims | Done | unresolved-aggregate-claims; Example15 |
| Historic depth/open gaps/source acquisition limits | Done | Historic Coverage; Research Gaps |
|≥15 worked examples | Done |21 examples |
| Source inventory/hash verification | Done | Input Inventory; validation.json |
| Offline validator and all-member checksum manifest | Done | validate.py; SHA256 SUMS |

| Future implementation / publication gate | Status | Required assertion |
|---|---|---|
| Justin approvals | Not run | Draft tiers block production; explicit acceptance and hash required |
| Historical identity resolution | Not run | Approved exact bindings; no duplicate legal-office claim or dropped history |
| Unchanged re-import | Not run | New attempt_id, same lineage release_id |
| Accepted correction | Not run | New release fingerprint; unaffected IDs stable; original claims preserved |
| Multi-lineage coexistence | Not run | Latvia-only operation leaves other rows/releases/citations intact |
| Poison FK rollback | Not run | Broken known source/event FK rejects staging; last-good serving; durable failed attempt |
| Missing≠zero | Not run | Round-trip NULL/unknown and explicit 0/zero separately |
| Date precision/certainty | Not run | Year 2003 stays year; no next-date invention or timestamp substitution |
| Indirect president | Not run | Saeima electorate only; no popular nationwide presidential denominator |
| Council chair/executive director | Not run | No synthetic direct-mayor office from a council row |
| Draft tier consumption | Not run | Hash-approved classification drives geographic tier; calendar labels ignored |
| Regional empty state | Not run |0 regional passes; labeled honest empty numerator |
| Fixture exclusion | Not run | FIX-/FXT-/demo/test fixtures excluded and injected fixture fails |
| Unresolved vs broken source | Not run | Genuine unresolved tokens explicit; no fabricated FK; resolved missing target fatal |
| Conflicting percentage claims | Not run | No authoritative metric from disputed claims until accepted resolution |
| Incomplete refresh | Not run | Omitted old office/event/result retained with diagnostic, not deleted |
| Out-of-window retention | Not run | Alert filter never filters office/history storage |
| Certification/repeat binding | Not run | No blanket certified status; repeat proceedings source-bound |
| Publication durability | Not run | Same-FS staging, WAL checkpoint/close, fsync, atomic rename, durable separate ledger |
| SQLite/VPS/UI/importer | Not run | No application/importer code or execution in this task |

- [ ] Justin accepts this research pack.
- [ ] Justin approves an exact tier revision.
- [ ] Justin accepts specific resolutions of named holds.
