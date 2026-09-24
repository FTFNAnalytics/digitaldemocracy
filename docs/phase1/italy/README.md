# Italy — Atlas Prompt AT research pack

Reference date: **23 September 2026**. Research/documentation only. **applied_changes=0**. All Justin approvals remain unchecked.

The current municipal, regional, autonomous-provincial, national and EP core is enumerated from official territorial and electoral evidence. This pack does **not** claim complete nationwide historical or submunicipal coverage. The named gaps are part of the handoff, not silent zeroes. No office is omitted because its next ordinary cycle lies beyond the approximate 18-month alert window.

| Measure | Count |
|---|---:|
| Current offices | 15,917 |
| Historical-only offices | 696 |
| Statutory pending FVG offices | 8 |
| All registered office rows / unapproved tiers | 16,621 |
| Current comuni | 7,894 |
| Municipal offices | 15,862 |
| Regional offices | 38 |
| Current autonomous-provincial offices | 3 |
| Current ordinary provincial/metropolitan popular offices | 0 |
| National offices | 3 |
| EP delegation offices | 1 |
| Firenze quartiere offices | 10 |
| Current direct executive offices | 7,992 |
| Current collective bodies | 7,924 |
| Indirect national head-of-state offices | 1 |
| Events | 515 |
| Events with numeric records | 392 |
| Result observations, including metrics | 606,051 |
| Reporting units | 28,989 |
| Retained source files | 409 |
| Named research gaps | 19 |

Draft tier histogram: T1=4; T2=38; T3=11; T4=16,568. Historical and pending offices each retain their own unapproved tier.

Read `docs/phase1/italy/justin-report.md`, `count-summary.md`, `research-gaps.md`, `mechanisms-and-law-vintages.md`, `identity-rules.md`, `methodology.md`, and `acceptance-examples.md`. The 223-column mapping is available as Markdown and JSON Lines, with the exact inherited contract under `contract/`.

The machine-readable register is `data/office-register.jsonl`, paired 1:1 with `data/draft-tiers.jsonl`. `data/events.jsonl` and `event-office-links.jsonl` preserve separate rounds/indirect ballots and explicitly shared joint ballots. `data/results.jsonl.gz` contains UTF-8 JSON Lines compressed with gzip; result types include contestant observations and distinctly labelled metrics. `data/reporting-units.jsonl` preserves reporting grain. Do not sum list/candidate, national/municipal, turnout or capacity measures together.

Current municipalities: 7,894 councils and 7,894 mayors, plus 74 popularly elected joint-ticket Valle d’Aosta deputy mayors. The 20 regional councils coexist with 18 direct regional presidents; VDA and TAA executives are council-selected. Trento/Bolzano have two provincial councils, with only Trento’s president direct. Ordinary indirect provincial/metropolitan classes are documented as exclusions. FVG’s four new direct councils and four presidents are pending first election. Firenze’s five quartieri provide ten explicitly evidenced submunicipal offices; other subdivision classes remain a named gap.

The President of the Republic is indirect, with thirteen winning assembly ballots normalized. Camera and Senato 2022 domestic returns, ten EP cycles, Lombardia/Lazio 2023, seventeen Bolzano provincial cycles, TAA municipal documents, Corte Palasio July 2024 and Firenze June 2024 supply the bounded history. Earlier EP dates retain year precision. Overseas coverage, earlier national/local cycles, missing mayor breakdowns and full certification require additional sources.

Every retained source has its original URL, exact byte hash, length and disposition in `data/source-inventory.json`. The advertised June 2024 municipal file has the wrong payload and is quarantined. Seven Bolzano printed vote-total discrepancies are preserved, flagged and listed in `data/arithmetic-audit.json`; figures are not altered to make sums agree. `data/office-history-coverage.jsonl` distinguishes missing evidence from zero contests.

Run `python validate.py` after extraction. It is a read-only standard-library validator by default. `SHA256SUMS` covers every file except itself. The separate `Italy_Atlas_Prompt_AT.zip.sha256` sidecar checks the ZIP. No importer, database schema, deployed service or production repository is modified by this pack.

- [ ] Justin approves research pack
- [ ] Justin approves draft tiers
- [ ] Justin authorizes any implementation
- [ ] Justin authorizes any publication

`validation-report.json` is the pre-seal data/source report. The separately delivered `Italy_Atlas_Prompt_AT.validation.json` records the final sealed-pack run, including the manifest. This separation avoids a report changing its own manifested hash.
