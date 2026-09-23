# Cyprus — Atlas Prompt AQ research pack

As of **2026-09-22**. Research and documentation only. **applied_changes=0**. All Justin approvals remain unchecked.

**Completeness gate:** this package names every one of the **285** free-area community councils in the retained Electoral Service composition table. The ministry overview says **286**. That discrepancy is unresolved: this is **not a certified complete current register**. See CY-G01. The 20 administered municipalities are fully named. No placeholder 286th council is fabricated.

| Measure | Count |
|---|---:|
| Current office rows | 714 |
| Historical-only office rows | 174 |
| Total office / draft-tier rows | 888 |
| Events | 1599 |
| Reporting units / views | 1679 |
| Result observations | 11112 |
| Administered municipalities | 20 |
| Named administered communities | 285 |
| Ministry overview community count (unreconciled) | 286 |
| Current local councils | 305 |
| Current direct executives | 404 |
| Historical local councils | 87 |
| Historical direct executives | 87 |
| Source payloads | 156 |
| Applied changes | 0 |
| Approved classifications | 0 |

Draft tiers: municipal **877**, regional **5**, national **5**, other **1** — exactly one unapproved draft per office. The direct-executive count includes the President, five district-organisation presidents, 20 mayors, 93 deputies and 285 community leaders. Community deputies are council-selected. The three religious-group representatives are elected but have no parliamentary vote.

Local coverage is limited to Republic-administered electoral units. Nine occupied municipalities and occupied-community local offices are excluded, as are all TRNC offices. The Republic’s displaced-elector local contests are not mislabelled as TRNC contests. National parliamentary constituencies and official presidential/EP totals retain their official electoral footing. CYSTAT territory does not by itself create an elected office.

The 18-month window applies only to upcoming alerts. All current offices and retained histories remain present. calendar.json contains nominal cycle years, not called poll dates or scheduled alerts.

Contents:

- `data/office-register.json`, `draft-tiers.json`, `municipalities.json`, `communities.json`, `municipal-quarters.json`: identities and territorial footing.
- `events.json`, `reporting-units.json`, `results.json`, `reconciliation.json`: observed elections and distinct source views. Country/district views and candidate preferences are **not additive**.
- `docs/phase1/cyprus/`: readable register, identity rules, 223-column map, acceptance examples, gaps, sources and Justin report.
- `contract/`: inherited pinned 20-table / 223-column contract. Historical Bosnia context is provenance only, not Cyprus data.
- `sources/`, `data/source-inventory.json`, `SHA256SUMS`: retained evidence and exact-byte hashes. Extracts are labelled.
- `validate.py`, `validation-report.json`: read-only structural/integrity validation; no importer, SQL, repository or publication code.

Run from any directory: `python /path/to/Cyprus_Atlas_Prompt_AQ/validate.py`. Standard Python library only, no network, no writes. A successful run means the frozen pack is internally consistent; it does not close the documented evidence gaps or approve implementation.

Start review with [Justin report](docs/phase1/cyprus/Justin_Report.md) and [research gaps](docs/phase1/cyprus/Research_Gaps.md). Missing values remain null; a portal labelled official or 100% counted is not automatically Gazette-certified.
