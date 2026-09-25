# Serbia identity rules — Prompt AX

## Namespace and stability
`serbia-research-ax-v1` is a research namespace, not a production release. Office IDs are stable research identities and never contain a release hash or run timestamp.

## Current local identities
A top-level local-self-government assembly and a city-municipality assembly are separate identities only when the source establishes a separately elected representative body. Parent city and city-municipality identities are never merged. `Palilula (Beograd)` and `Palilula (Niš)` remain distinct because parent geography is part of identity.

## Statistical unit is not automatically an office
The SORS territorial register's statistical-unit count is not sufficient evidence for an elected office. Current election tables show no separately elected councillors for the central same-name Užice, Požarevac and Vranje statistical units. Those rows are excluded. Sevojno, Kostolac and Vranjska Banja are included as separately elected city-municipality assemblies.

## Historical events and date precision
Event identity = office identity + source series/cycle + source-supported round. Dates never create or destroy office identity. Named 2013/2014/2015 off-cycle cases in the SORS 2016 bulletin retain year precision unless an exact day was separately transcribed. The 2020 per-office dates are not transcribed and remain unknown.

Polling-station repeat voting is not a second country/province-wide election event. A legally required presidential runoff is a separate election-round event.

## President
First and second rounds remain separate. No runoff is created for 2017 or 2022 because the retained final result series records a first-round majority.

## Political labels
Candidate/list labels are retained in source context. No cross-cycle party or coalition identity is inferred in `party_mapping`.

## Missing values
Missing or untranscribed votes, shares, seats or dates are `null` with an explicit status. Missing never means zero.

## Historical reforms
No municipality/city predecessor, merger or successor edge is written without source-specific legal evidence. `data/successor-crosswalk.json` is empty.

## Scope gates
Kosovo municipal/parallel rows are not duplicated into this Serbia pack. Serbia is not an EU Member State, so no European Parliament office is created.

## Publication
All release/publication/ingest destinations in the 223-column map are documentary only. No publication, import or operational change was executed.

## Retry status-change identity rule
The five predecessor rows are created only because RZS explicitly documents municipality→city status changes and states that no administrative-territorial boundary change occurred. Their crosswalk relationship is `same_territory_status_change`; it must not be interpreted as a guessed merger, split, or legal succession beyond the documented status change.
