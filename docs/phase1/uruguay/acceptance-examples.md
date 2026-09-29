# Uruguay BF — Acceptance examples

Passing these checks establishes internal consistency and evidence retention. It is not Justin approval, production authorization or proof of exhaustive historical coverage.

| Example | Validator check | Expected behavior |
|---|---|---|
| UY-BF-AC01 | `scope_current` | 314 current offices: 4 national, 38 departmental and 272 municipal. |
| UY-BF-AC02 | `scope_historical` | 24 source-identified historical bodies remain historical-only. |
| UY-BF-AC03 | `tiers` | 338 unapproved draft tier rows, exactly one per office. |
| UY-BF-AC04 | `territory` | 136 municipios across 19 departments, each with a council and an alcalde role. |
| UY-BF-AC05 | `canelones_32` | 32 current municipios and 64 municipal office roles in Canelones. |
| UY-BF-AC06 | `montevideo_8` | Eight Montevideo municipios, plus a distinct departmental Intendente and Junta. |
| UY-BF-AC07 | `duplicate_names` | La Paz, Quebracho and Cerro Chato names in different departments retain distinct identifiers. |
| UY-BF-AC08 | `alcalde_mode` | 136 alcaldes are selected by the popular municipal list result, with no separate executive ballot. |
| UY-BF-AC09 | `five_seats` | Each municipal council has five members, including its alcalde; the alcalde is not a sixth seat. |
| UY-BF-AC10 | `national_modes` | President and VP are jointly elected; Senate has 30 elected members plus the VP ex officio; Representatives has 99 seats. |
| UY-BF-AC11 | `historical_senate` | 1954 and 1962 Senate allocations each total 31 elected seats; the 2024 allocation totals 30. |
| UY-BF-AC12 | `calendar_current` | Every current office links to a prominent upcoming calendar entry. |
| UY-BF-AC13 | `calendar_hist` | No historical-only office has an upcoming ordinary election. |
| UY-BF-AC14 | `calendar_formulas` | Eight calendar entries use sourced formulas and occurrence years; exact dates remain null. |
| UY-BF-AC15 | `calendar_alerts` | Every calendar entry requires country-page prominence and remains included outside the alert window. |
| UY-BF-AC16 | `calendar_years` | The next national and conditional runoff cycle is 2029; the departmental and municipal cycle is 2030. |
| UY-BF-AC17 | `runoffs` | Held runoffs in 1999, 2009, 2014, 2019 and 2024 remain separate from first rounds. |
| UY-BF-AC18 | `no_2004_runoff` | The 2004 winning ticket is documented without a fabricated runoff. |
| UY-BF-AC19 | `joint_votes` | Every VP event references the joint presidential ballot; no independent VP vote vector exists. |
| UY-BF-AC20 | `deferral` | The postponed 10 May 2020 schedule has no result rows; the held 27 September contests are retained. |
| UY-BF-AC21 | `municipal_history` | The four municipal election inventories contain 89, 112, 125 and 136 observed units respectively. |
| UY-BF-AC22 | `blank_not_zero` | The blank 2015 Villa del Carmen / Asamblea Popular vote cell remains null. |
| UY-BF-AC23 | `explicit_zero` | Explicit source zeros remain distinguishable from null values. |
| UY-BF-AC24 | `source_links` | Office, event and result records link to retained evidence; all foreign keys resolve. |
| UY-BF-AC25 | `raw_hashes` | Every retained source matches its recorded byte count and SHA-256 digest. |
| UY-BF-AC26 | `contract_223` | 223 field mappings match the inherited 20-table contract exactly. |
| UY-BF-AC27 | `no_writes` | Applied changes and importer, SQLite, VPS, UI and repository changes all remain zero. |
| UY-BF-AC28 | `approvals` | Every Justin approval field is false and every approval checkbox is unchecked. |
| UY-BF-AC29 | `ep_zero` | European Parliament offices: zero. |
| UY-BF-AC30 | `mercosur_zero` | No MERCOSUR, regional parliament or party-organization office is created. |
| UY-BF-AC31 | `successors_zero` | No predecessor or successor edge is invented. |
| UY-BF-AC32 | `municipal_aliases` | Atlántida retains electoral letter Ñ; the Florida source typo does not create a Fray Bentos office. |
| UY-BF-AC33 | `CNG_gate` | 1954 and 1962 identify the collegiate national executive, with no invented President or VP contest. |
| UY-BF-AC34 | `canelones_certified` | All 32 Canelones municipal party vote vectors reconcile to the signed 2025 proclamation. |
| UY-BF-AC35 | `national_2024` | 2024 chamber allocations match Senate 16/9/5 and Representatives 48/29/17/2/2/1. |
| UY-BF-AC36 | `runoff_2024` | The signed 2024 runoff ticket vote totals are 1,212,833 and 1,119,537. |
| UY-BF-AC37 | `tie_proceeding` | The 2025 San Bautista draw is a proceeding, not another election. |
| UY-BF-AC38 | `history_limits` | The manifest explicitly marks historical numerical transcription incomplete. |
| UY-BF-AC39 | `source_candidates_partial` | The partial 2025 candidate-integration CSV does not establish office completeness. |
| UY-BF-AC40 | `alcalde_winners` | 125 alcalde identities from the 2020 OPP roster and 53 from 2025 proclamations retain distinct evidence statuses. |
