# Ukraine — Prompt BD research pack

Research snapshot: **28 September 2026**. **applied_changes=0**. All Justin approvals are unchecked. This is a reviewable documentation pack, not an importer or a production release.

## Coverage and counts

**3,000 current office rows; 5 historical-only rows; 3,322 events; 46,800 result records.**

The current register consists of 1 Parliament, 1 President, 22 oblast councils, 119 raion councils, 1,421 hromada/city councils, 1,421 direct municipal head offices and 15 separately elected city-district councils. Kyiv's council and mayor are included in the hromada/city count, separately from Kyiv oblast. Current direct executives total 1,422; councils total 1,577. EP offices and occupying-power institutions both equal **0**.

| Scope | Current | Historical only | Events | Results |
|---|---:|---:|---:|---:|
| national | 2 | 0 | 21 | 3,428 |
| oblast | 22 | 2 | 24 | 1,617 |
| autonomous | 0 | 1 | 1 | 0 |
| raion | 119 | 1 | 120 | 5,214 |
| hromada | 2,842 | 0 | 3,140 | 35,986 |
| city_district | 15 | 0 | 15 | 555 |
| special_city | 0 | 1 | 1 | 0 |

The register reconciles all **1,935** KATOTTG regional, special-city, raion and H-category records. This comprises 25 O, 2 K, 136 P and 1,772 H records. 303 of the H records are in Crimea: they are territorial-register entries, not a claim that post-reform local elections occurred. Of 108 administrative city districts, 15 have distinct elected councils evidenced by CVK. Administrative entries are not automatically offices.

There are **373 full territorial holds** and **one partial Novoaidar hold**. At local level, these mean **352 held H units plus Sevastopol**, and a partial restriction in one otherwise represented community. The 17 raion and three regional holds overlap those territories and must not be summed as distinct localities. These are dated election/scope holds, **not a complete current occupation/control census**. All current offices also have a nationwide martial-law upcoming-date hold.

## What the historical records mean

National history covers all eight parliamentary cycles from 1994 through 2019 and all seven presidential cycles from 1991 through 2019 (13 presidential rounds/polls). Earlier certified returns remain incomplete: 1991 is winner-only; 1994 presidential first round has no transcribed figures. Detailed coverage is in `history-coverage.md`.

**43,351 local result records are CVK surviving elected-person records as of 22 September 2026.** They are not a complete set of original candidate or party results. They link 41,955 councillors and 1,396 named heads to source-described elections in 2020–2022. The export has 23 empty head positions. Such positions still evidence offices but do not justify invented winners or totals. F58/F50 blanks remain null; no mandate counts are derived from the number of surviving members. A winner row with null votes is not a zero-vote election.

One malformed date element is repaired in a separately hashed parse view. The original remains unchanged; the damaged date remains null. Two councils absent from that export, Olyka and Slobozhanske (Kharkiv), retain their office identities through independently sourced city-status changes. No merger or successor links are guessed.

Historical-only rows preserve pre-2020 Vinnytsia raion plus four Ukrainian institutions in gated territories. This is an evidence-status distinction; it does not assert that every historical-only institution was legally abolished.

## Contents

- `data/office-register.jsonl`, `draft-tiers.jsonl`: 1:1 office/tier records, including historical rows.
- `data/events.jsonl`, `results.jsonl`: source-qualified historical records; dates and numeric nulls retained honestly.
- `data/territorial-register.jsonl`, `territorial-holds.jsonl`, `nested-district-audit.jsonl`: complete territorial accounting and explicit exceptions.
- `identity-rules.md`, `data/identity-notes.jsonl`, `research-gaps.md/.json`: scope, identity and election-era gates.
- `contracts/columns.json`, `field-map-223.json/.md`: exact inherited 20-table, 223-column contract and documentation-only dispositions.
- `sources/source-inventory.jsonl`, source captures, hashes and `sources/README.md`: retained evidence, including failed retrievals and source-format anomalies.
- `acceptance-examples.json/.md`, `validate.py`, `validation-report.json`, `SHA256SUMS`: review cases and integrity checks.
- `counts.json`, `Justin-report.md`: counts, limitations and unchecked decisions.

## Validate

From the extracted folder run `python3 validate.py`. It uses only Python's standard library, reads files and prints JSON. It makes no network, database or application writes. `SHA256SUMS` excludes itself; the external ZIP hash identifies the complete archive.

## Review boundary

The 223-column map is not a populated production schema. Draft tiers describe institutional level only and are unapproved; no swing rating is invented. No upcoming date is calculated from an expired term or the end of a martial-law extension. The approximately 18-month alert window does not limit office or history coverage.

- [ ] Justin approves scope and territorial holds
- [ ] Justin approves draft tiers
- [ ] Justin accepts history coverage and evidence grades
- [ ] Justin approves any future import/publication
