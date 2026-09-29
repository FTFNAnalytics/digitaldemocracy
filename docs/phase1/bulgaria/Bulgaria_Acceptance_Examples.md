# Bulgaria — acceptance examples

These are concrete evidence/identity acceptance cases, **not Justin approvals**. All 36 have an executable read-only assertion with the same ID in `validate_pack.py`. The saved `validation.json` records actual pass/fail results. Passing the audit does not resolve external source gaps or grant production approval.

| Case | Concrete input / scenario | Expected outcome |
| --- | --- | --- |
| A01 | Exactly 533 current in-scope, 1 historical-only, 3067 held offices | 533 current in-scope + 1 historical-only + 3,067 held = 3,601 rows. |
| A02 | All 530 accepted P IDs and original labels/geography preserved | Exact set equality to P; no lost office, changed name or changed geography key. |
| A03 | 3067 held identities never promoted | Every district/village row remains hold, even where votes exist. |
| A04 | 265 mayor/council pairs survive duplicate municipality labels | Both Бяла pairs remain: BG-RSE04-M/C and BG-VAR05-M/C; equal labels do not merge offices. |
| A05 | Tier records 1:1 and use the frozen P vocabulary | 3,601 rows map 1:1; municipal 3,597 / national 3 / other 1 (EP), using frozen vocabulary. |
| A06 | New BI approvals false, all Justin boxes unchecked | All new BI flags false and no checked Markdown approval box. |
| A07 | P event vectors preserved without any changed original field | 8,661 original event objects survive after removing only BI scope/provenance annotations. |
| A08 | P result vectors preserved without any changed original field | 25,817 original result objects survive with identical original fields. |
| A09 | All 10337 first-round/unresolved observations retained | 7,746 first-round and 2,591 unresolved retained observations; no synthetic events. |
| A10 | Gradec 2015 remains six first-round plus two unresolved observations | BG-SLV11-b88d0d4475-V: six first-round + two unresolved observations; no invented 2015 completion. |
| A11 | P missing votes and explicit zeros remain distinct | 587 null-vote percentage rows, 221 events; explicit zeros remain 26 votes / 28 shares / 14,247 seats. |
| A12 | Inherited history counts retain accepted/held separation | Accepted-local 1,590 / 10,343 and held-local 7,071 / 15,474 events/results remain distinct. |
| A13 | New event/result IDs unique and referentially complete | 31 unique added events and 421 unique added results; all foreign keys resolve. |
| A14 | Eight distinct parliamentary contests from 2021 through April 2026 | 2021-04-04, 2021-07-11, 2021-11-14, 2022-10-02, 2023-04-02, 2024-06-09, 2024-10-27, 2026-04-19 remain distinct. |
| A15 | Court correction stays on October 2024 contest, never new 2025 ballot | Velichie’s corrected 10 seats attach to 27 October 2024; no fabricated March 2025 poll. |
| A16 | 1997 untranscribed results remain zero rows, not zero-valued results | 19 April 1997 is date-only with zero transcribed rows, never a row saying zero votes. |
| A17 | EP begins in 2007 and all five contest years retained | 2007/2009/2014/2019/2024 EP events; no 2004 Bulgarian contest; later EP summary votes null. |
| A18 | Presidential joint family and separate rounds; invalid votes never seats | One joint President/VP family, four first rounds and four runoffs; all seat fields null. |
| A19 | Distinct historical GNA, 400 total seats across two explicit polling dates | Historical Grand National Assembly has two polling dates and one combined 400-seat allocation. |
| A20 | All five ordinary calendar families present and country-visible | Assembly, presidential ticket, EP, municipal councils and mayors all surface on country calendar. |
| A21 | 2027/2029/2030 formula cards do not invent exact days | 2027/2029/2030 have no invented scheduled day; year/formula precision retained. |
| A22 | Presidential official first ballot and formula-only conditional runoff | 25 October 2026 called first round; presidential conditional runoff remains a sourced seven-day formula. |
| A23 | Called Polski Trambesh by-election stays on existing mayor ID | 18 October and conditional 25 October 2026 bind existing BG-VTR26-M, never a duplicate mayor office. |
| A24 | Early Assembly contingency has no fabricated future day/year | Early-election contingency has null date/year and a source-cited constitutional path. |
| A25 | All 223 destination columns mapped exactly once, 20 tables | Exactly 223 unique table/column pairs across 20 tables; documentary implementation_applied=false. |
| A26 | No regional offices, guessed successors or applied changes | Regional offices=0, successor links=[], applied_changes=0, research completeness=false. |
| A27 | All BI typed/calendar/gap source IDs resolve | Every added typed, calendar and gap source ID resolves to the full catalogue. |
| A28 | Saved-source hashes match, extraction hashes never pretend to be raw | Each saved snapshot hash matches its bytes; extraction hashes do not claim raw HTML/PDF provenance. |
| A29 | Original register, tiers, vectors and payload hashes unchanged | Pinned original register, accepted tiers, identity vectors and payload retain their known SHA-256s. |
| A30 | Original archive member hashes and lengths verified without extraction | Every original tar member is safe, listed and hash/length matched without extracting or executing it. |
| A31 | Published aggregate conflicts explicitly retained and arithmetic reproducible | Five aggregate conflicts retain published headline and literal vector sum; no forced balancing. |
| A32 | Typed numeric and historical date domains valid | Counts nonnegative integers/null, shares 0–100/null, past ISO dates valid and ranges ordered. |
| A33 | Counts reconcile including held history and source-only observations | 8,692 events, 26,238 results, 10,337 additional observations reconcile with scoped counts. |
| A34 | README/report/dedicated calendar each contain first-class calendar | README, Justin report and dedicated calendar each show Upcoming elections including 2029/2030. |
| A35 | At least fifteen concrete acceptance examples with unique IDs | At least 15 individually identified cases; this pack supplies 36. |
| A36 | SHA256SUMS covers every packaged file and every hash matches | Every packaged file except the checksum manifest itself has a matching SHA256SUMS entry. |

- [ ] Justin accepts the evidence and holds after review.
