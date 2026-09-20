# Primary source → documentary projection

Static DIP JavaScript is parsed as text, never executed. Each register binding records exact zero-based var vrsta[i]. For types06/15/19/27 only two-digit county codetop entries define offices; repeated county ballot menus under municipalities are result filters. Types08/17/21/25 require real gradOpcina code. The source DAO routes Zagreb1333 to county21. The calendar does not classify offices.

Only whole-jurisdiction aggregate endpoints enter typed results: bm000, county/national grop0000. Filename and JSON scope must match register binding. Precinct CSV/XLSX and archived copies are retained, never added to these aggregate totals. The 2013, supplementary2025 and Split2022 ZIPs remain retained inputs pending additional projection.

| Source layout | Exact original field binding |
|---|---|
| Local2025/2021 JSON | /lista/i/glasova→votes; posto→share; naziv→label; stranke→party; jedinstvenaSifra→signature. zamjenici remains raw joint ticket. Metadata bmZatvoreno/bmUkupno, biraciGlasovalo, listiciUkupno/listiciVazeci/listiciNevazeci retained once per ballot, not summed per candidate. |
| Local2017,44 fields | Split newline then semicolon as DIP controller (not RFC4180 quote stripping). 0 type;6 processedBM;7 totalBM;11 electors;12 voted;14 ballots;15 valid;17 invalid;19 rank;20:31 partylabels;31 listhead or33 candidate;35–38 joint deputies;40 party shortlabels;41 signature;42 votes;43 percent. |
| President2024/2019 JSON | /lista/i/glasova,posto,naziv; nomination arrays raw. |
| President 2000/2005/2009/2014,35 fields | 5/6 BM;11 electors;12 voted;14 ballots;15 valid;17 invalid;19 rank;30 candidate;33 votes;34 percent. |
| Sabor2024/2020 JSON | Top-level /lista/i glasova/posto/naziv/jedinstvenaSifra; original party arrays; preference children /lista/i/lista/j retained raw, never extra list votes. |
| Sabor2015/2016 text | Metadata as President;19 rank;20:34 nomination labels;34 signature;35 label;36 votes;37 percent; remaining preference/numeric fields retained raw. |
| Sabor2007/2011,37 fields | Metadata as President;19 rank;20:35 nomination identity;34 list label or32 minority candidate;35 votes;36 percent. |
| Sabor 2000/2003,35 fields | Metadata as President;19 rank;20:33 nomination identity;32 list label or30 minority candidate (fallback32 if30 blank);33 votes;34 percent. |
| EP2024/2019 JSON | Top-level /lista/i glasova/posto/naziv/jedinstvenaSifra; preference children raw. |
| EP 2013/2014 text | 5/6 BM;10 electors;11 voted;13 ballots;14 valid;16 invalid;18 rank;28 source ballot/list number;29 list votes;30 label;31 percent;32 onward preference vector raw. |

Field indexes above are zero-based. CSV locators use physical newline records,1-based; original quote characters remain literal, matching DIP controller. Entire original line remains raw. JSON raw keeps every child/unknown field.

Comma percentage converts directly to numeric percent_0_100. No percentage is calculated. Blank→NULL/unknown; genuine0→0/zero; positive→recorded. All typed seats/elected flags are unknown; no rank-to-winner or mandate computation. A zero-BM ballot with no positive candidate data is a placeholder hold. Legacy national rows with positive votes and zero/missing BM counters remain historical claims. Tar-Vabriga lista is empty, hence zero typed rows, not a zero-vote result vector.

National source year remains year precision. Generation datum/vrijeme never becomes polling day. Local event date comes from source view h2. Runoffs and the explicitly advertised Stari Grad 2017 third round are proceedings within one cycle. Missing round2 endpoint is not proof no runoff happened. Original counts/denominators are retained even when they differ; Sabor minority basis is explicitly unresolved.

No global party mapping, geometry, competition, tightness or forecast projection. Resolved evidence uses exact source URL/hash and real FK; missing evidence remains an unresolved token.
