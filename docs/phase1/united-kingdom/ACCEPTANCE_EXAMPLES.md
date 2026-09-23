# Acceptance examples

These 35 cases use retained evidence and the actual pack. They describe acceptance requirements; `validate.py` checks the corresponding structural/data invariants.

| ID | Case | Expected acceptance | Check |
|---|---|---|---|
| A01 | Complete operational principal-council universe | 382 offices match the 361 LAD plus 21 county source codes; England 317 / Scotland 32 / Wales 22 / NI 11. | `principal_roster` |
| A02 | One Commons office, 650 constituency returns per general cycle | Five retained general cycles each have 650 source constituencies; not 650 office rows. | `commons_cycles` |
| A03 | No Lords, monarch or Prime Minister popular office | No such office/event rows; explicit exclusion gate G01. | `scope_exclusions` |
| A04 | Devolved offices stay distinct | Holyrood, Senedd and NI Assembly are three separate current offices. | `devolved` |
| A05 | Senedd 2026 changed system | Closed-list 16×6 constituency allocations sum to 96; 2021 source remains AMS. | `senedd96` |
| A06 | Holyrood two ballots | Constituency and regional-list vote scopes differ; seven published seat cycles each total 129. | `holyrood` |
| A07 | NI first preferences are not transfers | 239 candidate first-preference records across 18 Assembly constituencies in 2022; original transfer sheets retained. | `ni2022` |
| A08 | NI historical blank vs zero | Green 2022 published seats=0 remains explicit; blank early TUV cells are not fabricated zero contests. | `ni_history` |
| A09 | Mayor versus council | Bedford mayor and council have different office IDs and return universes. | `mayor_council` |
| A10 | Full direct executive roster | 27 current mayors plus 37 PCC/PFCC offices = 64, each with sourced results. | `executives` |
| A11 | No duplicated integrated PCC | Mayor-integrated policing has no duplicate standalone Greater Manchester, West Yorkshire, South Yorkshire, York/North Yorkshire or London PCC. | `pcc_scope` |
| A12 | GLA separation | Mayor, Assembly constituency ballot and London-wide list remain distinct; 14 Assembly constituency units. | `gla` |
| A13 | Current SV versus historical FPTP | GM 30 July 2026 first preferences, transfer increment and final totals share one event; no second poll is created. | `gm_sv` |
| A14 | Source arithmetic error stays visible | GM source ballot-paper discrepancy of five remains in arithmetic audit; neither total is silently repaired. | `arithmetic` |
| A15 | Cumbria PCC share quality gate | Printed vote counts retained; contradictory printed shares are raw and normalized share is null. | `cumbria` |
| A16 | Postponed poll date | Coventry Radford is dated 20 June 2024; Higham Ferrers and Mansfield North 12 June 2025. | `postponed` |
| A17 | Unopposed does not mean zero votes | Shropshire Albrighton 2021 placeholder zero is normalized as unopposed with null votes. | `unopposed` |
| A18 | Scilly remains beyond alert window | Next stated election 3 May 2029 is outside the 18-month alert window; office and 2025 history remain. | `alert_window` |
| A19 | Surrey transitional coexistence | East/West Surrey shadow offices are separate from 382 operational councils, and have source-index events without invented totals. | `shadow` |
| A20 | Legal continuity prevents invented twin | North Yorkshire and Somerset continue as unitary bodies; no duplicate historical county row is created. | `continuity` |
| A21 | Explicit historical-only offices | 18 dissolved councils, seven former mayors and the UK EP delegation are historical-only; no guessed successor edges. | `historical` |
| A22 | EP exit | Nine historical EP cycles ending 2019; no current UK EP office or post-Brexit contest. | `ep` |
| A23 | EP party identity | Party codes retain election-term namespaces; numeric votes stay null where only shares and seats are published. | `ep_namespace` |
| A24 | Parish gate | Only 27 named directory councils, not every precept area; no invented parish-wide completeness. | `parish` |
| A25 | City and park special classes | City aldermanic body and three Scottish elected components are distinct; appointed membership is excluded. | `special` |
| A26 | Boundary and event grain | Raw boundary-set URLs/source vintages are retained; identical names do not create successor links. | `boundary` |
| A27 | Source status matters | Declared official results and Elections Centre research compilations are not both relabelled certified. | `evidence_status` |
| A28 | Corrupt upstream CSV preservation | Four original unquoted-comma rows stay quarantined; four explicit official HTML replacements supply values. | `csv_repairs` |
| A29 | STV image gap | 21 image-only NI pages stay retained and flagged; no invented first preferences or transfer totals. | `image_gap` |
| A30 | Waterside legal outcome | Court certificate confirms the return; no repeat event is created. | `waterside` |
| A31 | Draft tiers 1:1 | Exact office-ID coverage, one draft tier each; no approved flags. | `tiers` |
| A32 | 223-column contract | Exactly 223 distinct table.column mappings and unchanged inherited column names. | `field_map` |
| A33 | Votes and majority are not the same row type | Candidate result labels exclude Majority/Turnout/Electorate table metrics. | `result_integrity` |
| A34 | Research-only approval state | applied_changes=0; all Justin approval boxes remain unchecked. | `approvals` |
| A35 | Source bytes and archive integrity | Every source hash and package manifest entry matches; ZIP CRC and extraction verify before delivery. | `hashes` |
