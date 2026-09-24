# Italy — identity rules

Use the office as the unit of registration, not every seat, candidate, precinct or reporting row. Camera, Senato, the indirect President and the EP delegation are separate bodies/offices. Prime Minister, cabinet, prefectures and party organizations are outside scope.

Current comune identities are `IT.COMUNE.<six-digit ISTAT code>.council`, `.mayor` and, only in Valle d’Aosta, `.deputy_mayor`. Current names, hierarchy and cadastral codes come from SITUAS report 61 at the reference date. A reporting-unit name in an older return does not automatically resolve to a current comune. Current office creation dates and incumbents remain unknown unless separately sourced.

Historical commune identities add `.ended-YYYY-MM-DD` before the body suffix. Only explicit ES extinction records generate these historical-only rows. `successor-crosswalk.jsonl` contains the official related territorial unit and legal reference; every row has `office_successor_asserted=false`. Territorial absorption does not prove constitutional/legal continuity of an office. Name changes, province recoding and partial boundary movements do not create guessed merger edges.

The 20 regioni use `IT.REGIONE.<code>`. TAA has a composite regional council; its provincial councillors are not an independent regional vote universe. The two autonomous provinces use `IT.PROVINCE.021` and `.022`. The 2026 FVG province classes use a separate `IT.FVG.2026` namespace and pending status. Ordinary indirect provinces/metropolitan bodies occur in the disposition table, not in the popular register.

Dates retain source precision. A year-only EP cycle has `date=null`, `date_precision=year`; a runoff whose exact day is absent is unknown, not January 1 or a mechanically calculated interval. Poll dates, publication dates and effective territorial dates remain different claims. A source-dated July poll is not labelled a repeat without source evidence.

Events are keyed by office, source cycle and actual variant. Numbered presidential ballots are indirect assembly proceedings. A council/list and executive can have distinct events when votes are separately supplied. A joint list/mayor return can instead have one event linked to both offices. Event-office links explicitly prohibit duplicate vote counting.

Reporting units have separate IDs and source-era labels. Parliamentary municipality/constituency cross-sections, Firenze precincts and EP municipal reports are not new elected offices. National mixed-system list votes and candidate votes are different measures, not additive votes. Repeated candidate totals next to coalition lists are retained once per candidate/reporting unit.

Result IDs are pack-local sequential documentary locators. A durable external identity would require event, reporting unit, source row and vote/seat measure. All source IDs resolve to exact retained bytes. CSV locators count the header as row 1. PDF locators refer to page/table row or deterministic extracted-layout line; raw source text is retained where a label is combined. A combined table-row label is not a canonical party or person identity.

Party/list codes are scoped to source and event. No cross-cycle party harmonization or party-organization office is invented. TAA source list numbers and candidate/list label combinations keep their ambiguity. The eight S.S.D.V. name expansions are documented lexical aliases within Bolzano, not territorial successions.

Missing votes, seats, shares, dates, certification and elected flags remain null or absent. A dash is not zero. Zero is retained only when supplied. No votes are reverse-engineered from percentages, no missing runoff mathematics is invented, and no allocation calculator is present. Aggregate totals, turnout/papers and council capacity have metric result kinds and must not become contestant votes/seats. Published arithmetic conflicts are retained and flagged rather than silently repaired.

All classifications and approvals remain unapproved. The 18-month horizon filters upcoming alerts only. It never removes an office or historic event from this register.
