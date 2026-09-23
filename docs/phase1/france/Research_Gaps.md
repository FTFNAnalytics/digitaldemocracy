# France research gates and exclusions

Current office enumeration and historical-return completeness are separate claims. The register is complete within the stated current scope and COG2026 vintage; history and certification are not exhaustive.

## G01 — Presidential rounds

National France-entire candidate returns cover 1995, 2002, 2007, 2012, 2017 and 2022, both rounds. Earlier Fifth Republic cycles and annulment-level evidence are not normalized. Each round has its own electorate and valid-vote universe; no transfer arithmetic.

Evidence: `FR-S-mechanisms-web-extract.json`.

## G02 — Senate indirect election

2014/2017/2020/2023 renewals are electoral-college contests, not nationwide popular ballots. Majority districts permit multiple candidate marks. 2020 workbook does not supply seat/elected fields; they stay null. Foreign-resident senators and later partial renewals require separate reconciliation. 27 September 2026 is upcoming at this snapshot.

Evidence: `FR-S-mechanism-senate.html`.

## G03 — Municipal mayoral selection

Mayors are elected by municipal councils; no direct mayor office or popular mayor contest is created. Arrondissement mayors are likewise council-selected. Councils temporarily administered by special delegations remain legal council offices; absent 2026 poll is not zero votes.

Evidence: `FR-S-mechanisms-web-extract.json`.

## G04 — Regional and departmental executives

Council presidents and the relevant special-collectivity executives are council/assembly-selected. No regional or departmental direct-executive row is created.

Evidence: `FR-S-regional-executive-mechanism.html`.

## G05 — Commune-nouvelle identities

All 13,734 COG movement records are retained. Current commune snapshot is 1 January 2026. Historical council identities are separated at documented creation/re-establishment/code-transition gates where old returns exist, including retained-code communes nouvelles. Geographic movement is not asserted legal office succession: successor-crosswalk remains empty pending legal-act review. Historical code-change continuity stays gated.

Evidence: `FR-S-cog2026.zip`.

## G06 — 2015–2016 regional reform

2010 pre-reform regions and 2015 post-reform-region ballots remain distinct where the codes changed; 18 historic regional-council identities are retained. December 2015 contests concern the new regions taking effect in 2016. No guessed predecessor-to-successor links. Corsica pre-2018 assembly is historical-only.

Evidence: `FR-S-insee-special-status.html`.

## G07 — Departmental and special-collectivity coverage

101 administrative departments do not imply 101 distinct elected departmental councils. This register contains 95 departmental councils including Alsace and transitional Mayotte, 3 single territorial assemblies, Paris municipal/departmental council once, and Lyon metropolitan council once. Guyane/Martinique old departmental returns, Alsace predecessors and departmental history before 2021 are not normalized.

Evidence: `FR-S-insee-special-status.html`.

## G08 — Mayotte transition

COG territory is 976R from 2026, but the list-elected Assembly of Mayotte starts at the 2028 renewal. The current transitional council and its 2021 binomial ballots are retained; no future 52-seat assembly is inserted as a second current office.

Evidence: `FR-S-mayotte-transition2028.html`.

## G09 — Overseas scope

83 additional real communes: Polynésie française 48, Nouvelle-Calédonie 33, Saint-Pierre-et-Miquelon 2. Saint-Barthélemy and Saint-Martin statistical COM rows identify territorial collectivities, not extra municipal councils. Wallis-Futuna districts, TAAF districts, Clipperton and Île des Faisans are not elected municipal offices. The 5 COM assemblies and NC Congress plus 3 provincial assemblies are named.

Evidence: `FR-S-insee-overseas-codification.html`.

## G10 — New Caledonia provincial returns

The official portal identifies definitive June 2026 provincial results, but quantitative attachments were not retrievable. Congress and all three provincial assemblies are present; no invented result event, vote or seat allocation. Congress draws 54 members from provincial ballots and has no separate nationwide ballot. 2019 and earlier provincial returns remain unnormalized.

Evidence: `FR-S-overseas-retrieval-gates.json`.

## G11 — Wallis-Futuna repeat election

2022 proclaimed representatives are retained without votes. Sigave is explicitly gated because a later repeat election occurred in 2023; the original return is not a current incumbent list. Quantitative 2022 votes, annulment decision and 2023 repeat results remain to be pinned.

Evidence: `FR-S-legal-search-evidence.json`.

## G12 — Polynesian municipal returns

2026 national portal Polynesia tables include aggregate participation without named lists. These 70 commune-round units are retained as metrics-only, not zero-vote elections. Electoral sections remain reporting units of their parent commune in the older data.

Evidence: `FR-S-mun2026r1-pf.csv`.

## G13 — EPCI exclusion and Lyon exception

Ordinary EPCI executives are council-selected and excluded, and nationwide EPCI council coverage is outside this requested municipal register. Métropole de Lyon is a territorial collectivity with a separate popular metropolitan council ballot and is included. Communal CC seat columns are not municipal seats.

Evidence: `FR-S-epci-mechanism.html`.

## G14 — PLM separate ballots

34 current arrondissement/sector councils are included from the 2026 dedicated official return. The 45 INSEE administrative arrondissements are not 45 elected councils. Paris Centre covers the first four arrondissements. Before 2026, sector returns are reporting units of the city-council election, not independent invented citywide vote totals.

Evidence: `FR-S-wf-municipal-mechanisms-web.json`.

## G15 — EP seats and vote universes

Official EP national tables contain published vote percentages and constitutive-session seat composition for 2009/2014/2019/2024. These are not raw votes or necessarily election-night party seats. 2019 records 74 seated MEPs at the constitutive session, not the later Brexit-adjusted 79. 2024 Interior regional raw-vote file covers only 18 regions, omitting some overseas/abroad reporting; never label its sum a France-entire return. No reverse-engineered votes.

Evidence: `FR-S-ep2019-official.html`.

## G16 — Certification, corrections and arithmetic

Interior data are official published returns with stated appeal/correction reservations. Definitive-labelled presidential extracts and the proclaimed 2022 COM returns are separately tagged. Published arithmetic discrepancies are retained in a named table and must be resolved before any certification claim. An integrity PASS is not election certification.

Evidence: `FR-S-meta-mun2026r1.json`.

## G17 — History coverage and partial elections

Municipal 2014/2020/2026, regional 2010/2015/2021, departmental 2021, National Assembly 2022/2024, Senate 2014–2023, presidential 1995–2022 and EP 2009–2024 selected cycles are normalized. Later by-elections, judicial annulments, repeats, dissolution follow-ups and exhaustive earlier history remain open. Raw retained files sometimes cover more levels than normalized tables.

Evidence: `FR-S-catalogue-presidential.json`.

## G18 — 2014 candidate/list regime

2014 precinct text uses head-of-list labels even for small-commune candidates. Its mixed vote regime is explicitly unresolved at row level; candidate totals are not tested against one-vote-per-ballot sums and seats/elected flags remain null.

Evidence: `FR-S-mun2014-49c6f5cd.txt`.

## G19 — Upcoming window

The 18-month window filters only the calendar. All current offices and sourced history are present regardless of future date. 2028 March is month-precision and straddles the 22 March window end. Most local exact next dates are deliberately unresolved. No alert was created.

Evidence: `FR-S-senate2026.html`.

## G20 — Tier authority

Tiers are provisional body-level classifications, one per current or historical office, not approved Atlas production IDs. No original Prompt Y/Z production import contract was newly verified; the inherited 20-table/223-column field list is pinned as documentation only.

Evidence: `FR-S-cog2026.zip`.

Chatain (86063), 2026 round one: the official file supplies panel 1, 65 votes and 9 council seats but no list name. The empty label is preserved and documented in extraction-issues.json. No contestant identity is invented.
