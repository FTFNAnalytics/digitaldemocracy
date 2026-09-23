# Research gaps and gates

The core current register is complete against the retained rosters. **The whole research coverage flag is false:** older history, parish/community coverage, some 2026 local returns and detailed STV normalization remain incomplete. Missing data never means zero or no office.

## G01 — House of Lords, monarch and government

**Excluded**. No popularly elected national Lords chamber, monarch, Prime Minister or Cabinet office is created. Ceremonial and appointed institutions are described only.

Evidence: `GB.SOURCE.hoc-current-voting-systems-web-extract.json`.

## G02 — Commons boundary reviews

**Open historical comparability gate**. 2010/2015/2017/2019/2024 official candidate files retain boundary-set URLs and constituency codes. Same names are not automatic same-geography identities. Historical/notional boundary-adjusted returns are excluded. Older pre-2010 returns are not normalized.

Evidence: `GB.SOURCE.commons2024-candidates.csv`.

## G03 — Commons by-elections

**Partial historical coverage**. Parliament periods 55–59 supply retained by-election indexes and candidate CSVs. Four malformed CSV rows are retained in quarantine and repaired only via the separately retained official HTML cells. Archive coverage is not asserted as a complete centuries-long series.

Evidence: `GB.SOURCE.parliament59.html`.

## G04 — Scottish Parliament

**Law and boundary vintage gate**. AMS constituency and regional ballots stay separate. Published seven-cycle constituency/regional seat summaries cover 1999–2026; duplicate overall Total rows remain in the raw workbook and are not normalized; detailed 2026 votes use the workbook corrected 14 July 2026. Party-only labels in constituency sheet are not invented candidate names. Constituency geography and region allocations are distinct.

Evidence: `GB.SOURCE.holyrood2026-tools.xlsx`.

## G05 — Senedd

**Law vintage gate**. 2026 uses 96 seats in 16 six-member constituencies and closed lists; earlier cycles used 60-seat AMS. Six-party national summaries are partial party coverage. Explicit seat cells are counted, not reconstructed from votes. No invented parties, votes or proportional-seat mathematics.

Evidence: `GB.SOURCE.senedd2026-table.ods`.

## G06 — Northern Ireland Assembly

**History and STV gate**. 1998–2022 historical party tables and 2022 candidate first preferences are retained. 108-seat and 90-seat vintages are not conflated. Suspensions/restorations do not create new offices. Full transfer papers remain in originals; only first preferences are normalized.

Evidence: `GB.SOURCE.ni-assembly2022-report.pdf`.

## G07 — Northern Ireland local STV

**Open image/transcription gap**. All 11 councils are registered with 2023 evidence. Twenty-one image-based PDF pages are retained for visual transcription. Accepted first-preference groups pass published-total checks. No unavailable transfer, excluded, exhausted or fractional papers are fabricated.

Evidence: `GB.SOURCE.ni2023-index.html`.

## G08 — Direct mayor roster and law change

**Current roster established; older history open**. 13 local-authority mayors, 13 strategic-authority mayors and the Mayor of London are distinct direct offices. All have at least one sourced return. SV/FPTP/SV vintages must be retained: 2023–May 2026 FPTP evidence cannot be applied to current-law supplementary vote or earlier SV contests.

Evidence: `GB.SOURCE.hoc-mayors-pcc-web-extract.json`.

## G09 — 2026 electoral-system change

**Commencement and event-specific gate**. Retain the English Devolution and Community Empowerment Act 2026 and Commons briefing. The Greater Manchester 30 July 2026 by-election provides actual SV evidence. First preferences, transferred second preferences and final total are one poll with distinct count stages, not a two-round presidential system.

Evidence: `GB.SOURCE.devolution-act2026.html`.

## G10 — PCC/PFCC scope

**Current standalone roster established; future-policy gate**. 37 standalone offices; mayor-integrated policing functions are not duplicate PCC offices. Police/fire title changes do not create a second popular office. Proposed/announced 2028 abolition is not treated as effective in September 2026. Scotland and NI police administration is not invented as a PCC universe.

Evidence: `GB.SOURCE.pcc-current-evidence.html`.

## G11 — London GLA

**Separate ballot universes**. Mayor and Assembly are distinct. 14 constituency contests and the London-wide list are separate AMS measures. The 2024 mayoral FPTP count has no invented SV transfer round.

Evidence: `GB.SOURCE.local2024-handbook.pdf`.

## G12 — Principal council territorial universe

**Current core register established**. 361 May 2026 ONS LAD territories plus 21 surviving county councils produce 382 operational councils. City of London and Isles of Scilly are special classes. District/county overlaps do not mean duplicate bodies.

Evidence: `GB.SOURCE.ons-lad2026.json`.

## G13 — English local-government reorganisation

**Open succession gate**. 1974, 1990s, 2009 and later reorganisations are not an exhaustive historical register here. Eighteen 2023 dissolved councils are explicitly source identified. Do not derive full merger edges from accounts-transfer labels or name similarity. Future July 2026 announcements are not current operational council rows.

Evidence: `GB.SOURCE.abolished-councils2023-official.pdf`.

## G14 — North Yorkshire / Somerset continuity

**Resolved primary-law continuity**. Structural Orders continue the county council as sole principal authority in 2023. 2022 elections attach to the continuing body; no invented twin historical county offices. Boundary/election vintage remains explicit.

Evidence: `GB.SOURCE.north-yorkshire-structural2022.pdf`.

## G15 — Surrey shadow authorities

**Distinct transitional status**. Two elected 2026 shadow authorities are current_shadow, with results-index events but no invented numeric returns. They are excluded from the 382 operational council count. Existing county/district authorities are retained until vesting; no speculative succession graph.

Evidence: `GB.SOURCE.surrey-shadow2026.html`.

## G16 — Parish/community/town universe

**Open completeness gate**. 27 individually source-identified councils from the Tonbridge and Malling directory are retained, not a UK-wide universe. A precepting-area spreadsheet includes meetings, groupings and other bodies and cannot be converted automatically into elected offices. Scottish community councils and Welsh communities require separate statutory/roster/election validation. The directory narrative says 26 but lists 27.

Evidence: `GB.SOURCE.parish-gm-office-search-evidence.json`.

## G17 — City of London

**Special franchise and body-overlap gate**. Resident and business ward electorates elect Common Councillors and Aldermen. The separately elected aldermanic component is recorded without adding its seats again to a Common Council total. Lord Mayor, Sheriffs, livery organisations and ward ceremonial offices are not separate popular executive rows.

Evidence: `GB.SOURCE.city-latest-results-web-evidence.json`.

## G18 — Scottish special elected components

**Partial office-class coverage / history gap**. Two national park elected components and six elected Crofting Commissioners are established; ministerial appointees and board-selected chairs are excluded. These are not wholly elected park/commission boards. Park term rules need park-specific evidence; no uniform term is asserted. Detailed election returns remain to normalize.

Evidence: `GB.SOURCE.parks-city-system-search-evidence.json`.

## G19 — Historical European Parliament / Brexit

**Historical-only gate**. Nine EP cycles 1979–2019 retained. Source 2019–2024 is an EP term label; UK participation ended on 31 January 2020. No 2024 UK election or current UK EP office is invented. GB and NI systems differ; term-specific party identifiers stay scoped. Shares and constitutive seat totals do not supply missing absolute votes.

Evidence: `GB.SOURCE.ep-2019-2024-uk.json`.

## G20 — Crown Dependencies / British Overseas Territories

**Default territorial exclusion**. No separate Jersey, Guernsey, Isle of Man or BOT registers are created. Gibraltar appears only as part of a historical UK EP reporting footprint, not as a separately scoped current register.

Evidence: `GB.SOURCE.ep-2019-2024-uk.json`.

## G21 — Evidence status and source errors

**Open certification/quality gate**. Parliament verified compilations, EONI count sheets, council declarations, EP official returns and Elections Centre research compilations are labelled separately. No generic certified flag is assumed. Cumbria PCC printed shares disagree with vote counts and are withheld. GM verified papers differ by five from valid plus rejected; source values are retained without repair.

Evidence: `GB.SOURCE.gm2026-ro-web-extract.json`.

## G22 — Local handbook normalization

**Partial result-detail gate**. 2021–2025 numeric candidate marks are extracted, not all unopposed declarations or winner formatting. Most local candidate/party labels remain combined. Source adjusted multi-member party shares stay raw; votes are not summed as unique voters. Three explicit unopposed zero placeholders become null vote totals.

Evidence: `GB.SOURCE.local2022-handbook.pdf`.

## G23 — Postponed/countermanded polls

**Resolved for explicit handbook cases**. Fifteen named delayed ward/division polls in 2022–2025 use actual dates stated by the source. Thirsk and Malton 2010 uses the Commons Weekly Bulletin’s 27 May date; the candidate CSV cycle-date value of 6 May is retained in the original source. Full-council postponements do not create nonexistent elections. Date of publication/counting is not a poll date.

Evidence: `GB.SOURCE.local2025-handbook.pdf`.

## G24 — Electoral litigation / repeat polls

**Case-specific gate**. Waterside High Court certificate 23/046064 confirms Martin Reilly duly elected; it is not an annulment or a repeat election. Recounts, petitions and fresh polls must be distinguished by their legal outcomes.

Evidence: `GB.SOURCE.ni2023-petition-outcome-waterside-dea-august-2023.pdf`.

## G25 — Historical offices and older contests

**Open completeness gate**. 26 historical-only office rows are evidenced but not a full abolished-council/mayoralty/constituency inventory. Historic mayor and dissolved-council returns are not yet normalized. Some 2026 local and earlier devolved/GLA/PCC/local results remain outside this normalized selection. All source originals retained are larger in scope than normalized rows.

Evidence: `GB.SOURCE.historic-mayors-web-evidence.json`.

## G26 — Upcoming dates and alert window

**Open scheduling gap**. Only explicitly sourced next dates are supplied. Isles of Scilly 3 May 2029 remains in the office register with history despite lying outside the 18-month alert window. Unknown schedules are not zero events or exclusions. No generated next-cycle arithmetic.

Evidence: `GB.SOURCE.scilly-elections.html`.

## G27 — Unreviewed Atlas classifications and links

**Justin approval required before any application**. All tiers are draft 1:1 proposals. No importer, SQLite, VPS, UI or repository changes. No political party mapping or geographic successor link is approved. Schema map remains documentary.

Evidence: `GB.SOURCE.ons-lad2026.json`.
