# Estonia research gaps and named holds

DRAFT; all Justin decisions remain unchecked. Register coverage and internal extraction integrity do not imply complete historical research.

## EE-G01 — 2017 reform and historical identities

200 historical EHAK-coded council identities are retained from the 2013/2017/2021 rosters. Presence or disappearance is not a legal establishment/abolition date. No guessed successor edges. Antsla 0142 versus 0145, Põhja-Pärnumaa 0638 versus 0637, and Tori 0809 versus 0806 illustrate code/boundary binding reviews.

Resolution evidence: Obtain official EHAK temporal register and each relevant legal act; review code continuity and boundaries explicitly. 2013 election roster = 215; do not mislabel it as the exact immediately-pre-2017 legal count.

Locators: `register-source-rows.json; geography.json; human-review.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G02 — History before 2013 and intervening specials

Four complete extracted local ordinary-cycle rosters are included (2013, 2017, 2021, 2025). Earlier 1993–2009 councils, abolished before 2013, and intervening repeat/special contests are not fully normalized. The official history index names earlier counts, but counts alone do not create offices.

Resolution evidence: Acquire older individual official municipal returns and temporal codes; retain each new source-identified historical office, never synthesize from an aggregate count.

Locators: `official local-election archive and archive-member-inventory.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G03 — Presidential 2021 and indirect franchise

Official English presidential archive retained 1992, 1996, 2001, 2006, 2011, 2016, 2026 pages; attempted 2021 routes did not return a usable primary page. No 2021 numeric row invented. Current presidency is indirect; 1992 is an evidenced transitional popular-ballot exception.

Resolution evidence: Acquire 2021 NEC/Riigikogu original rounds and decision; attach to the same presidency with exact ballot context. Do not turn 101 electors into a popular electorate.

Locators: `proceedings.json; source-acquisition-gaps.json; presidential source HTML`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G04 — Municipal executive selection / legal access

No current direct-executive office is asserted. Linnapea/vallavanem are treated as council-selected, not additional popular ballots. Some Riigi Teataja URLs returned only application shells, so those bytes are explicitly not legal text.

Resolution evidence: Retain operative Local Government Organisation Act and current legal exception register before asserting an exceptional direct popular executive. Mere mayor name or council chair is insufficient.

Locators: `sources.json content_use=javascript_shell_not_legal_text`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G05 — EP delegation and mandate changes

One Estonia EP delegation, proposed other. Three source cycles 2014/2019/2024; candidate elected/reserved flags are election-snapshot fields, not a live MEP roster. Brexit-related 2019/2020 mandate changes and later replacements are not normalized as new contests.

Resolution evidence: Justin approves EP tier convention; verify supplementary mandate/replacement records without duplicating an ordinary ballot.

Locators: `EE-EP; EP archive XML`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G06 — Archive status and supplied totals conflict

All 457 local/parliamentary/EP candidate vectors reconcile internally to their chosen XML totals. However the 2013 detailed XML sums to 625,334 while official 2013 general statistics reports 625,336 valid votes. Both original claims remain. No arbitrary two-vote correction or certified whole-cycle total.

Resolution evidence: Obtain authoritative correction/version explanation. Keep global aggregate disputed/unresolved; retain candidate rows as supplied with legal_outcome unknown. Numerical internal consistency does not establish certification.

Locators: `vote-reconciliation.json; info.kov2013.vvk.ee/uldinfo/; KOV_2013_VOTING_RESULT_BY_PARTIES XML`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G07 — Date precision

215 local 2013 events use sourced year precision in this handoff. Their acquisition/generated dates are not treated as election dates. Current next cycles are official homepage year-only 2027/2029 metadata, with no invented prospective event.

Resolution evidence: A primary dated call/occurrence may refine a date without changing HK/event_id. Keep 2029 offices and history outside the alert window.

Locators: `events.json /date; office-register.json /next_date`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G08 — Jõhvi–Toila current transition

Official 2025 metadata explicitly names the merged Jõhvi council 0250. Earlier Jõhvi 0251 and Toila 0803 remain historical identities. The local official merger page supports the merger context; exact legal effective-day and executable successor crosswalk remain unset.

Resolution evidence: Review the final merger act and legal effective date before adding successor relations. Do not erase the two prior councils.

Locators: `EE-M0250-C, EE-M0251-C, EE-M0803-C; johvi.ee merger page`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## EE-G09 — Totals, elected flags and missing scalar fields

Candidate votes, elected and reserved flags are preserved where explicitly supplied. Numeric candidate seats and most candidate shares stay NULL. Party/list totals, mandate counts and geographic breakdowns are retained in a separate nonadditive table and original XML.

Resolution evidence: Do not add candidate and party totals, infer seats=0 from absent elected flag, or manufacture candidate percentages from a list percentage. Reconcile evidence before any derived margins or claims of full return certification.

Locators: `results.json; nonadditive-list-summaries.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.
