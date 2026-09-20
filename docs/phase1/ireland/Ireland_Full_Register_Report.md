# Republic of Ireland — full register / Prompt AB / DRAFT

## One-page executive

Pinned main **`0482d5ac79f7f27565ddd6c71394259a3737c989`**. Sources captured 20 September 2026. **36 current + 86 historical offices; 196 events; 7,254 result rows.** Draft tiers across 122 offices: **118 municipal / 0 regional / 3 national / 1 other**. All Justin boxes unchecked; `applied_changes=0` for repo/importer/SQLite/VPS/UI.

The 31 council names also reconcile to the current [Local Government Ireland directory](https://www.localgov.ie/find-my-local-authority), retained by hash. Current bodies are **31 local authority councils**, **Dáil Éireann**, **Seanad Éireann**, **President of Ireland**, **Ireland's EP delegation**, and **the directly elected Mayor of Limerick**. The presidency is included as an evidenced popular elected office under the full-register policy. Seanad remains one chamber: 49 elected members through restricted franchises, 11 Taoiseach nominees excluded from election rows. Council-selected mayors/cathaoirligh, appointed CEOs, cabinet and Taoiseach are not fabricated popular offices. **Northern Ireland is excluded.** [Local council rules](https://www.electoralcommission.ie/local-council-elections/), [Seanad rules](https://www.electoralcommission.ie/seanad-eireann/), [Limerick mayor](https://www.electoralcommission.ie/limerick-directly-elected-mayor/).

Historical offices are **75 town councils, 5 borough councils and 6 pre-2014 city/county councils**. All have sourced 2009 contest context; none is deleted by the 2014 reform. Source statutory successor provisions are retained without guessed individual town-to-current-authority edges. [2001 Schedule 6](https://www.irishstatutebook.ie/eli/2001/act/37/schedule/6/enacted/en/html), [2014 section 9](https://www.irishstatutebook.ie/eli/2014/act/1/section/9/enacted/en/html), [section 24](https://www.irishstatutebook.ie/eli/2014/act/1/section/24/enacted/en/html).

Historic returns include **5,148 candidate rows from 395 reconciled 2009/2014 local first-count tables**, partial 2019 local returns, Dáil 2002/2007/2011 party totals, 2016/2020 candidate records, 686 Dáil 2024 candidates, two 2026 Dáil by-elections, 140 Seanad 2025 candidates, 15 Limerick 2024 mayoral candidates, and presidential first-count totals 1945–2011. Dáil 2016/2020 typed vote fields remain unknown for 1,082 rows because supplied votes are later-count snapshots; raw figures and explicit outcomes survive. STV transfers are never summed into first preferences. [Official Dáil and Seanad handbooks](https://www.oireachtas.ie/en/elections/).

All 31 councils and the mayor retain **expected 2029 year-only** next metadata; EP 2029 is explicitly stated by the Electoral Commission. No 2029 polling day is invented. These offices/history remain even outside the alert window. Regional numerator 0 is honest: county councils are local government; regional assemblies are constituted through council appointments under SI573/2014 Article 5, not separate popular assembly ballots. Their internal chair election is not a popular mandate. [EP calendar](https://www.electoralcommission.ie/european-parliament-elections/).

**Open gates:** most 2019 and all 2024 local candidate vectors; EP result histories; recent presidential returns; older Seanad general results and vacancy completeness; source encoding defects; detailed successor/boundary bindings; final candidate seat/outcome transcription from complex tables. The retained Seanad handbook includes bye-election pages but they are not silently treated as a complete normalized vacancy universe. Current Higher Education reform does not rewrite the 2025 NUI/TCD return. Mapping completeness is not research completeness: **coverage_complete=false**.

## Scope and historic depth

| Office type | Current | Historical | Events | Result rows | Source cycle years |
| --- | --- | --- | --- | --- | --- |
| borough_council | 0 | 5 | 5 | 108 | 2009 |
| directly_elected_mayor | 1 | 0 | 1 | 15 | 2024 |
| elected_president | 1 | 0 | 7 | 24 | 1945, 1959, 1966, 1973, 1990, 1997, 2011 |
| european_parliament_delegation | 1 | 0 | 1 | 0 | 2024 |
| local_authority_council | 31 | 6 | 98 | 3976 | 2009, 2014, 2019, 2024 |
| national_lower_chamber | 1 | 0 | 8 | 1832 | 2002, 2007, 2011, 2016, 2020, 2024, 2026 |
| national_upper_chamber | 1 | 0 | 1 | 140 | 2025 |
| town_council | 0 | 75 | 75 | 1159 | 2009 |


## Quality and decisions

Source extraction audit reconciles 395 local tables, 43 Dáil 2024 constituency sheets and 7 Seanad 2025 panels/university vectors. Retained PDFs include full count stages. Exact page/cell locators, raw hashes and complete identity vectors accompany every admitted row. Events with no result vector (2024 councils and EP) remain real evidenced events with unknown results. Legal outcome stays unknown unless future source-specific legal review establishes certification; no annulled/repeated chronology is invented.

Full research gaps: `data/research/ireland/research-gaps.json`; field map covers 223 columns; acceptance examples and future CI gates are in adjacent docs. SHA256SUMS and validator check artifacts only. Production tier status is draft_for_human_review; no importer/publication has run.

- [ ] Justin accepts the register and explicit exclusions.
- [ ] Justin accepts or amends the proposed tiers.
- [ ] Justin accepts named gaps and historical identity policies.
- [ ] Justin authorizes a separate implementation task.
