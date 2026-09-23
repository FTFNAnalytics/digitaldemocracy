# France acceptance examples

These checks distinguish successful extraction from unresolved research. They are not Justin approvals.

| ID | Case | Expected |
|---|---|---|
| FR-A01 | Current registry | Exactly 35,112 current body/direct-executive rows; offices are not filtered by the alert window. |
| FR-A02 | Commune footing | 34,875 COG COM entries − 6 appointed Meuse communes + 83 overseas communes = 34,952 elected municipal councils. |
| FR-A03 | Direct executives | Exactly 1 current direct executive: FR-PRESIDENT; zero direct mayor rows. |
| FR-A04 | National offices | FR-AN direct, FR-SENATE indirect, FR-PRESIDENT direct, FR-EP direct; no PM/cabinet/prefect office. |
| FR-A05 | Senate votes | Electoral-college candidate marks are not a popular nationwide first-preference universe. |
| FR-A06 | Presidential rounds | 1995, 2002, 2007, 2012, 2017 and 2022 each have exactly two sourced rounds. |
| FR-A07 | 2022 round totals | Presidential valid votes: R1 35,132,947; R2 32,057,325. No runoff subtraction. |
| FR-A08 | 2022 runoff | MACRON 18,768,639; LE PEN 13,288,686; sum 32,057,325. |
| FR-A09 | Council departments | 95 departmental councils, not 101 inferred offices from administrative department codes. |
| FR-A10 | Paris | Exactly one current municipal/departmental Council of Paris; no extra FR-CT-75C council. |
| FR-A11 | Lyon | Municipal FR-MUN-69123 and metropolitan FR-CT-69M are distinct; metropolitan president is council-selected. |
| FR-A12 | Alsace | One FR-CT-6AE, no current separate 67D or 68D departmental councils. |
| FR-A13 | Mayotte | One transitional FR-CT-976R; future 2028 assembly does not produce a second current office or invented current 52 seats. |
| FR-A14 | Regional footing | 14 ordinary regional councils plus 3 single territorial assemblies; Mayotte counted under its transitional departmental council. |
| FR-A15 | PLM | 34 elected sector councils; do not convert 45 INSEE administrative arrondissements into 45 councils. |
| FR-A16 | NC Congress | 54-seat Congress derives from provincial ballots; no separate nationwide Congress vote invented. |
| FR-A17 | Overseas communes | 48 PF + 33 NC + 2 SPM; SB and SM territorial councils are not additional municipal councils. |
| FR-A18 | Meuse exceptions | All six named appointed commissions are excluded from elected council rows. |
| FR-A19 | Historical gates | Pre-merger retained-code council and current commune-nouvelle council remain distinct research identities. |
| FR-A20 | Succession | successor-crosswalk is empty; territorial movements are retained without guessed office edges. |
| FR-A21 | Draft 1:1 | Every current and historical office has exactly one tier; all status=draft and approval=false. |
| FR-A22 | Missing vs zero | PF 2026 metrics-only units generate no placeholder zero-vote lists. |
| FR-A23 | 2020 candidate marks | Small-commune candidate vote sum is not required to equal valid ballots. |
| FR-A24 | EP 2019 | National constitutive-session seats sum to 74; no invented 79-seat immediate 2019 allocation. |
| FR-A25 | EP 2024 | National party-composition seats sum to 81; partial 18-region vote file is not national coverage. |
| FR-A26 | Overseas proclamation | Saint-Barthélemy R2 2022 votes 1,970 and 1,905; seats 13 and 6. |
| FR-A27 | WF evidence | 20 returned representatives have null votes; Sigave original return carries a repeat-election gate. |
| FR-A28 | Source arithmetic | 38 known source arithmetic discrepancies are retained and separately flagged; no fabricated balancing entries. |
| FR-A29 | Field contract | Exactly 223 unique table.column mappings across 20 tables; no operational writes. |
| FR-A30 | Hash integrity | Every retained source has a URL, byte count and SHA-256; manifest covers all pack files except itself. |
| FR-A31 | Alert isolation | Calendar has one row per current office, all alert_created=false; Senate 2026 renewal remains upcoming, not history. |
| FR-A32 | No approvals | applied_changes=0; justin_approved=false; report checkboxes remain unchecked. |
| FR-A33 | Parser repairs | Two malformed 2020 labels repaired without changing any numeric cells; original raw files retained. |
| FR-A34 | 2014 ambiguity | Mixed candidate/list regime stays explicitly unresolved; no fabricated seats or turnout denominators. |
| FR-A35 | Exact dates | Year-only PF cycles remain year-only; polling-day exceptions are not silently coerced to a global same-day assertion. |
| FR-A36 | History limits | Current office presence does not imply all past results or current officeholders are complete. |
