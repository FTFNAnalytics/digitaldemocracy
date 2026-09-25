# North Macedonia identity and selection rules

All IDs are stable within this research pack only. `MK-NAT-PARLIAMENT` and `MK-NAT-PRESIDENT` each identify one continuing independent-republic office. Local IDs distinguish council from mayor. Candidate/list labels retain source spelling; ballot numbers are not party IDs. No ideology or party-family mapping is assigned.

## Independent republic and 2019 name gate

The 1990 parliamentary election occurred while Macedonia was a constituent republic of Yugoslavia and is outside this pack's independent-republic events. The 1991 President was chosen by the Assembly; no popular presidential election is invented. The first popular presidential election retained is 16 October 1994. Sources: `ipu-1994`, `mia-presidents`.

Prespa entered into force on **12 February 2019**. The domestic Republic of Macedonia name, the international provisional reference “the former Yugoslav Republic of Macedonia” (FYROM), and Republic of North Macedonia are source-era labels under the same office IDs. This is the requested FYROM → North Macedonia gate; FYROM was not the domestic constitutional name. No rename election, new country-office copy or successor edge is created. Source: `un-rename`.

## Territorial gates

The official SSO register describes 80 municipalities, eight statistical regions and ten component municipalities within the City of Skopje. SEC2025 separately enumerates 80 municipality contests and the city-wide contest. The Ministry English directory's omission of Centar is treated as a directory error, not abolition. Sources: `sso-territorial`, `mls-directory`, SEC2025 result URLs.

City of Skopje has a separate elected council and mayor. Its ten municipalities are Aerodrom, Butel, Gazi Baba, Gjorche Petrov, Karposh, Kisela Voda, Saraj, Centar, Chair and Shuto Orizari. Each municipality also has its own council and mayor: 22 offices in the Skopje municipal/city structure. No other nested assembly is invented. Eight statistical regions do not produce elected regional-office rows.

**2004:** the territorial reform reduced 123 municipalities to 84. Full historical abolished/altered unit enumeration is not yet established in this pack. No anonymous or guessed historical rows are manufactured.

**2013:** ODIHR2013 p.4 footnote5 identifies Kichevo, Zajas, Oslomej, Vraneshtica and Drugovo and states the change is effective from the 2013 local elections, reducing 84 municipalities to 80. SSO records the NTES amendment in Gazette10 of20January2014. The latter statistical publication date is not substituted for the election-law effective gate. Eight historical council/mayor identities are retained for the four former municipalities. Their 2009 event existence is a documented join between nationwide election coverage and the named territorial units. No numeric local result is inferred. Kichevo's pre/post-reform electorates must not be assumed comparable. Source-supported territorial incorporation is recorded separately from office identity: **office successor edges remain empty**.

## Popular selection and rounds

Current Parliament is unicameral and elected by proportional representation; historic electoral systems require their own era rules. Parliamentary first/second-round events in1994/1998 are not forced into the current PR model. The1994 final seat table is supplemental cycle data because the IPU narrative describes final seats while its table heading says Round1.

The President is directly elected for five years. Under the rules described in ODIHR2024, winning in round1 requires more than half of all registered voters. If nobody meets that threshold, the top two proceed to a runoff two weeks later; the candidate with the most votes wins if turnout reaches at least40% of registered voters. Otherwise the electoral process must be repeated. Valid-vote share is not the legal first-round denominator. Older editions, including earlier turnout rules, remain gated rather than overwritten with today's rule.

All municipal and City of Skopje mayors are directly popularly elected for four years. ODIHR2025 p.8 states: first-round absolute majority of votes cast; top-two runoff two weeks later; at least one-third registered-voter turnout in round1, otherwise a repeat election within60days without a turnout requirement. Councils are directly elected using closed-list PR, no threshold, with9–33 members and45 for the City of Skopje. Source: `odihr-local2025`; original legislative PDF transcription remains an open evidence item.

First rounds, runoffs and expressly evidenced repeats are separate events. A cumulative result after partial repeat voting must not be added to the earlier return. Candidate maxima do not automatically produce `elected_flag=true`, particularly where turnout invalidates the election.

## Values and certification

Each result declares its unit: individual candidate, council list, parliamentary list or party/cohort aggregate. “Independent” and “Other” columns in2017/2021 mayor tables may combine people and are never promoted to candidate identities. Explicit source numbers are retained, including source arithmetic discrepancies; diagnostics do not repair them. Original row tokens and page locators accompany extracted group rows.

Reported percentage bases differ:2009/2024 presidential percentages use valid votes,2014/2019 use votes cast in the reproduced tables. Many live local percentages have no explicit denominator on the captured page; those remain labelled unknown rather than recast. No missing total is reconstructed and labelled reported.

2025 dashboards remain `official_portal_certification_not_established`; processed100% is neither vote share nor legal certification. Council seat values marked `derived_from_displayed_elected_roster` count source-listed names by ballot-list position. Lists absent from the roster retain null seats rather than an inferred zero. Both original and cumulative Shuto Orizari rosters are retained.

The EU candidate status creates **zero EP offices**. European Parliament observation delegations in ODIHR reports are observers, not elected North Macedonian offices.
