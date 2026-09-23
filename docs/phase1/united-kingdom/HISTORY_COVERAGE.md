# Historic contests and result coverage

## Normalized evidence

| Family | Coverage | Interpretation |
|---|---|---|
| Commons | Five general cycles: 2010, 2015, 2017, 2019, 2024; retained by-election CSVs in Parliaments 55–59 | Actual candidate counts and valid-vote checks; 2010 deferred constituency poll is distinct. Notional files excluded. |
| English/Welsh principal councils | Contested numeric rows from 2021–2025 handbooks, plus source-specific City/Scilly additions | All current principal bodies have sourced history; this is not every ward/candidate/cycle or all 2026 local results. |
| Scottish councils | All 32 councils, 2022 party aggregates | First preferences and reported seats, not transfer paper normalization. |
| NI councils | All 11 councils, 2023 | Workbook/text-PDF first preferences plus image-only retained gaps. |
| Holyrood | 1999–2026 positive seat summaries; detailed 2026 constituency/list votes | Summaries and granular returns overlap; never sum together. |
| Senedd | 2021/2026 six-party summaries and 2026 explicit constituency seat cells | Smaller-party missing rows not zeros; system changes in 2026. |
| NI Assembly | 1998–2022 party summaries; 2022 candidate first preferences | Year-only summaries do not invent day precision. |
| Mayors/PCC | All 64 current direct executives have at least one sourced return; 2023–2026 local mayor returns, 2024 PCCs, 2024–2025 metro/London, 2026 GM SV by-election | A current office having history is not a complete historical series. |
| City aldermen | Selected 2025–2026 contested and unopposed returns | Restricted resident/business ward electorate. |
| Historical EP | All nine election cycles 1979–2019, official shares and constitutive seats | Numeric votes unavailable in these JSON returns remain null. |
| Historical councils/mayors; parks/crofting; parish subset | Office rows retained, detailed return normalization incomplete | Named gaps, not zero-contest claims. |

## Counting rules

There are **899 event records** and **103,648 result records**. Different ballot components, summaries, postponed polls and by-elections may create separate event records. Results include candidates, party aggregates, seat summaries, unopposed returns and SV count stages. Neither count is a count of unique real-world elections.

Current offices with normalized results: **452 / 482**. Per-office coverage and exact missing cases are in `data/coverage-by-office.jsonl`. The two Surrey shadow offices have results-index events but no invented numeric returns.

Quarantine: **25 original extract records/pages**: 21 NI image pages and four malformed upstream Commons CSV rows. The four CSV results have separately sourced HTML replacements.

Raw original documents may contain additional returns not normalized here. Compilation status is preserved separately from official declarations and legal certification.
