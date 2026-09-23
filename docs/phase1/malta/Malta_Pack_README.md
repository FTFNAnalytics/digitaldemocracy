# Malta Atlas research pack — Prompt AP

As of 22 September 2026. **applied_changes=0**. All Justin approvals are unchecked.

Start with `docs/phase1/malta/Malta_Justin_Report.md`. Exact counts are in `data/counts.json`; machine-readable registers and returns are JSON. This research pack contains no importer, SQL/database, VPS, UI or repository changes.

The current register includes every one of Malta's 68 local councils (54 Malta, 14 Gozo), mayor/deputy offices with their actual conditional mechanism, six indirect regional presidencies, House, indirect President and EP delegation. Two historical Gozo civic offices are retained separately.

Three ordinary council returns per current council are covered: 2024, 2019 and the council's 2013 or 2015 return. National and EP histories include the complete cycles exposed in their selected official portal archives. Historical coverage is bounded, with named gaps and no guessed successor links.

- `data/office-register.json`, `draft-tiers.json`: exact 1:1 register and unapproved classifications.
- `data/events.json`, `results.json`, `reporting-units.json`: office-cycle events, first preferences and selected declared outcomes, source scopes/totals/elected cards.
- `data/stv-counts.json`, `count-totals.json`: count tallies/deltas and non-transferable/total observations. Ellipses stay null; never sum across counts.
- `data/party-aggregates-derived.json`: transparent sums of candidate returns, not separate ballots.
- `data/post-election-return-observations.json`: later-election, resignation, constitutional/court and other card annotations; not a full verified casual-election timeline.
- `data/regional-nominations-not-results.json`: nominees are not silently converted into elected outcomes.
- `data/territorial-gates.json`, `successor-crosswalk.json`, `calendar.json`: creation/boundary gates, no inferred successor edges and year-only ordinary horizons.
- `data/source-inventory.json` and `sources/`: evidence captures and per-capture hashes. Browser/text extractions are labeled; legislative PDFs are original downloaded bytes.
- `contract/` and `data/field-map-223.json`: exact inherited 223-column contract and documented Malta mappings.
- `docs/phase1/malta/`: readable office register, tiers, identity rules, 36 acceptance examples, research gaps and Justin report.
- `SHA256SUMS`, `validate.py`, `validation-report.json`: integrity/semantic checks and executed report.

Run `python validate.py` after extraction. No network or third-party Python packages are required. Run `python validate.py --self-test` for isolated negative tests. The manifest covers all files other than itself and the validation report; the report is intentionally outside the hash cycle. The ZIP's external SHA-256 is supplied separately.

Only upcoming/alert eligibility uses the approximately 18-month horizon. Offices and historic returns remain in this pack regardless of distant ordinary cycles. Missing evidence is never encoded as zero.
