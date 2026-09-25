# Acceptance examples

These are review cases and offline validator gates, not Justin approvals.

| ID | Case | Expected | Rule |
|---|---|---|---|
| A01 | full_register | 164 current and8 historical-only | Retain offices outside alert window. |
| A02 | unique_keys | 172 unique office IDs | No council/mayor or rename collisions. |
| A03 | national_local | 2 national +162 local current | No party organizations or government office. |
| A04 | councils_mayors | 81 councils +81 popular mayors | City of Skopje adds a separate pair. |
| A05 | executives | 82 current direct executives | 81 mayors plus President. |
| A06 | skopje | 20 component-municipality offices +2 city-wide | Parent relation is geographic only. |
| A07 | zero_ep | EP0 and regional0 | EU candidate and statistical regions create no offices. |
| A08 | historic_units | Drugovo,Vraneshtica,Zajas,Oslomej;8 offices | Retain named historical-only units. |
| A09 | successor_gate | 0 office successor edges | Do not guess links from territorial incorporation. |
| A10 | tier_one_to_one | 172 tiers for172 offices | No orphan or missing draft classification. |
| A11 | tier_histogram | national2;municipal170 | Historical offices count in draft tiers. |
| A12 | approvals | All false;applied_changes0 | Research pack never authorizes implementation. |
| A13 | references | Every event/result resolves | No result on fabricated office. |
| A14 | evidence | All source IDs resolve | Every numeric row has a source locator. |
| A15 | presidential_rounds | 2024-04-24 R1 and2024-05-08 R2 | Do not collapse runoff into first round. |
| A16 | independence | No pre1994 popular events | No invented popular1991 President. |
| A17 | failed_turnout | 4 invalid2025 mayor events | Votes do not establish an elected mayor. |
| A18 | repeat2026 | 4 events on2026-01-11 | No missing totals treated as zero. |
| A19 | upcoming | Brvenica2026-10-18 only | Alert filtering does not delete offices. |
| A20 | 2025_coverage | 81 council and81 first-round mayor vote vectors | Separate city-wide and municipal results. |
| A21 | runoffs | 33 mayor runoff events | No guessed runoffs for all81 offices. |
| A22 | null_semantics | Reported status requires a number | Conflicting or missing remains null. |
| A23 | zero_dash | Explicit0 differs from-- | 2024 parliamentary dash seats are null. |
| A24 | aggregate_units | 2017/2021 local rows are party_group_aggregate | Independent/Other is not a candidate name. |
| A25 | 2014_conflict | Pendarovski runoff votes null | No silent fix of contradictory sources. |
| A26 | debar_date | 14November2021 runoff | Retain annex14October typo in note. |
| A27 | partial_revote | ShutoNov2 vector is cumulative | Never add October andNovember municipal totals. |
| A28 | certification | Live SEC portals unconfirmed finality | 100% processed is not certification. |
| A29 | contract | 20 tables;223 exact mappings | Inherited contract names remain unchanged. |
| A30 | operational | No writes to operational tables | No ingest/publish receipt simulated. |
| A31 | coverage_claim | current complete;history partial | Research coverage flag remains false. |
| A32 | numeric_domains | Nonnegative votes/seats;shares0–100 | Do not parse footnote115 as vote digits. |
| A33 | seats | 81 first-round rosters plus re-vote | Recompute positive seats by ballot-list position. |
| A34 | arithmetic | Source differences retained | Diagnostics never rewrite reported figures. |
| A35 | acceptances | At least15 examples | This pack has39. |
| A36 | counts | Recompute totals from data | Report matches JSONL records. |
| A37 | source_hashes | Every extract hash and byte count verified | Raw PDF hashes labelled separately. |
| A38 | manifest_coverage | Every payload file listed | SHA256SUMS itself excluded to avoid recursion. |
| A39 | manifest_integrity | Every listed digest matches | Tampering or missing files fail validation. |
