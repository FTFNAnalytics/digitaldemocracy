# Latvia research gaps and named holds — DRAFT

Mapping completeness is not research completeness. All acceptance decisions remain pending Justin.

## LV-G01 — 2021 reform and cross-epoch identities

The complete 2017 election roster119 is kept as119 historical source-scoped identities. It is NOT the legal council count immediately before reform and NOT119 abolished councils. This conservatively retains even similarly named continuing bodies pending explicit identity binding. The post-reform roster is40 June 2021 contests +2 September 2021 contests + Riga elected 2020=43 jurisdiction observations. Current 2025 roster42. Madona 2021 and Varakļāni 2021 remain separate from enlarged Madona 2025. No successor edges are emitted.

**Resolution gate:** Review official temporal ATVK identities and legal acts, including the 2020 Riga change and 2021/2025 reform effective dates. Accept exact crosswalk rows with hashes before merging any 2017 record into a current office. Historical record counts cannot be used as distinct abolished-government counts.

Locators: `register-source-rows.json; office-register.json; geography.json; legal annex and transition33.1–33.9`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G02 — Earlier history and repeat ballots

Normalized local history covers1192017 events,42 regional-reform-year 2021 municipal contests, Riga 2020, and42 current 2025 contests. Earlier 1994–2013 cycle pages are retained as context but not fully normalized. The 2017 Ķekava precinct repeat is noted by CVK; the July 2017 XML snapshot is retained without adding a second completed council cycle.

**Resolution gate:** Acquire older office-level returns and temporal identifiers; identify certification/repeat decisions and attach a proceeding only when its source/key is concrete. Do not count station totals or cycle-index links as new offices.

Locators: `official local-election archive; electionresults636363813214220000.xml; source-acquisition-gaps.json`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G03 — Presidential ballots are incomplete and indirect

Six evidenced cycles 1993/1996/1999/2003/2015/2023 are included.1993/1996/1999 have occurrence evidence but no numeric result vector.2003 retains the winner 88/96 claim with year precision.2015 has only fifth-ballot winner 55.2023 PDF covers the first round:25,42,10 support;87 valid ballots,10 against all. Later 2023 ballots and 2007/2011/2019 vectors are not synthesized.

**Resolution gate:** Acquire complete Saeima election protocols and dated decisions. Separate ballots and support/opposition counts; never convert parliamentary electors into nationwide voters. Do not use inauguration dates as election days.

Locators: `president.lv biographies; titania.saeima.lv PDF pages1/4; proceedings.json`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G04 — Council chair versus executive director

Pašvaldību likums section 10(1)(11) assigns election/removal of the council chair to the council; section 10(1)(12) assigns appointment/removal of executive director. They are different offices/functions and neither is an additional popular ballot in this pack.

**Resolution gate:** Require an explicit popular-election legal exception and returns before creating any separate direct executive. Planning regions and administrative groupings are not elected council offices here.

Locators: `likumi.lv law336956 section10;0 direct popular executive rows`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G05 — EP delegation and replacements

One Latvia EP delegation, proposed other, with 2014/2019/2024 list returns. Candidate preference vectors and later replacements are not normalized into extra contests. Explicit list seats only; absent 2019 result-table seat values stay NULL even where a separate winner table exists.

**Resolution gate:** Justin accepts EP tier convention; any mandate enrichment requires an exact evidenced list-key join. Retain original elected snapshot versus current membership distinction.

Locators: `LV-EP; three official EP archive cycles`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G06 — Seven competing 2022 percentage claims

CVK detailed archive/API and current summary disagree for seven winning lists. Exact votes match. Archive percentages remain stored but flagged disputed, with both claims and locators in unresolved-aggregate-claims.json. No alternate is selected, no denominator silently changed.

**Resolution gate:** Obtain official denominator/version explanation and accepted field-specific resolution. Until then affected percentages are withheld from public authoritative metrics; votes and original claims remain. Internal vector reconciliation does not settle competing percentages.

Locators: `unresolved-aggregate-claims.json; vote-reconciliation.json; current CVK Saeima summary`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G07 — Certification, result grain and absent fields

210 complete list vectors reconcile to supplied valid ballots. Valid envelopes and valid ballots differ; list percentages use the source basis, not an invented common denominator. Candidate preference marks, station detail and national district breakdowns are retained raw and are nonadditive. Blank 2025 seats are unknown; explicitXML/HTML0 is zero.

**Resolution gate:** Complete certification/annulment review before calling all returns certified. EP2014 approval is explicitly evidenced; other archival provenance is not a blanket legal certification. No margin/tightness computation supplied.

Locators: `results.json; original XML/HTML; vote-reconciliation.json`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G08 — Dates and out-of-window alerts

Only the announced Saeima 2026-10-03 upcoming contest is emitted. Municipal and EP future days remain unknown; four/five-year ordinary terms may be described but no 2030-style synthetic event is created. PRES2003 remains year-only. Every current office stays even without an in-window next date.

**Resolution gate:** Refine only with primary call/occurrence evidence; leave HK/event IDs unchanged. Alert filters never delete offices or history.

Locators: `events.json; office-register.json next_date; CVK homepage`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.

## LV-G09 — Retained source scope

188 official source URL records are retained, including navigation, JavaScript API discovery assets and duplicate URL aliases for identical bytes. Those context pages are not evidence for absent numeric facts. The full 2017 XML includes candidate/station data beyond the normalized list grain.

**Resolution gate:** Do not claim normalized candidate-level or all post 1991 research completeness. Preserve every original file and source-specific licence metadata; refresh only as a new release.

Locators: `sources.json; input inventory; retained data.gov.lv metadata`.

- [ ] Justin accepts a sourced resolution.
- [ ] Justin amends or retains the hold.
