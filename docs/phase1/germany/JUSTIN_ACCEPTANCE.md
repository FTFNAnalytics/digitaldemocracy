# Justin acceptance — Germany Prompt AS

**Date:** 2026-09-22 (MT); independent recount 2026-09-23  
**Decision:** Accept with named holds  
**Scope:** 21,960 current + 670 historical offices (22,630 total); 13,845 events; 1,299,670 result records in the full pack

## Accepted
- Current territorial core at the 2026-08-31 Destatis vintage, with documented city-state and small-assembly exceptions
- 21,960 current offices and 670 historical-only office/code identities (54 council codes, 610 historic mayor codes, six source-established former assemblies)
- Draft jurisdiction tiers, one per office: tier 1 = 3, tier 2 = 20, tier 3 = 552, tier 4 = 22,055
- Numeric jurisdiction tiers are kept as supplied. They are not remapped onto municipal / regional / national / other
- Bundespräsident stays indirect (Federal Convention electorate). No popular presidential ballot
- Bundesrat stays excluded. No popular Bundesrat office or return
- Land executives (Minister-Presidents and city-state Senates) stay excluded as popular offices
- NI member-municipal mayors and BW/SH Landräte stay out of the direct-executive roster
- 26 source-coded whole-unit territorial relations stay in the crosswalk with office continuity not asserted
- Fifteen conflicting Land seat panels and Bavaria 1950 party votes stay withheld. Both raw observations remain
- Standing Atlas policy (full register even outside the ~18-month alert window)
- `research_coverage_complete`, `current_requested_scope_complete`, and `historical_coverage_complete` stay false
- Structural delivery check in the full pack was reported PASS (`applied_changes=0`; Justin boxes in `metadata.json` stay unchecked)

## Named holds (open, not closed)
No hold was amended or closed. Pack disposition labels are retained. None of them authorizes a fabricated roster, edge, or repaired panel.

1. DE-G01 — overall_current_scope (open)
2. DE-G02 — Bundespräsident (history_extended; indirect; left open)
3. DE-G03 — Bundesrat (explicit_exclusion; left open)
4. DE-G04 — Bundestag_seat_mechanics (version_gate; left open)
5. DE-G05 — Land_executives (explicit_exclusion; left open)
6. DE-G06 — Schleswig_Holstein_executives (partially_resolved; 86 verified direct mayors; modes incomplete; left open)
7. DE-G07 — Lower_Saxony_member_mayors (mechanism_gate; left open)
8. DE-G08 — Baden_Wuerttemberg_Landraete (explicit_exclusion; left open)
9. DE-G09 — Gebietsreform_successions (partially_resolved; 26 relations do not assert office continuity; left open)
10. DE-G10 — Bezirke_Ortschaften_scope (partially_resolved; named subdivision rosters still missing; left open)
11. DE-G11 — reunification_and_GDR (historical_boundary; left open)
12. DE-G12 — European_Parliament (bounded_history; left open)
13. DE-G13 — local_history (partially_resolved; left open)
14. DE-G14 — Berlin_2026_export_conflict (quarantined; left open)
15. DE-G15 — Mecklenburg_Vorpommern_2026 (partially_resolved; preliminary totals retained; left open)
16. DE-G16 — Hamburg_historical_source_conflict (resolved_retained_original; original panel retained; hold left open)
17. DE-G17 — certification_and_preliminary (open)
18. DE-G18 — source_missing_labels (open)
19. DE-G19 — municipal_vintage_and_small_assemblies (partially_resolved; left open)
20. DE-G20 — association_transition (mechanism_gate; left open)
21. DE-G21 — future_calendar (open)
22. DE-G22 — inherited_schema (review_required; 223-column map inherited from France; left open)
23. DE-G23 — historical_numeric_conflicts (withheld_pending_corroboration; 15 Land panels + BY 1950; left open)

No missing Schleswig-Holstein mayor, elected subdivision roster, successor edge, or repaired seat panel was invented for this landing.

## Authoritative pack counts
- 21,960 current + 670 historical offices
- Events 13,845; reporting units 47,762; result records 1,299,670
- Current direct executives in the delivered subset: 9,585 (9,075 municipal mayors, 248 Kreis executives, 262 association executives). This is not a completed nationwide census
- Current local councils / elected assemblies: 12,356
- Territorial municipalities: 10,747; municipal council offices: 10,718; Kreis councils: 294; Land parliaments: 16
- Federal offices: Bundestag + Bundespräsident (2); EP delegation: 1
- Draft tiers: 3 / 20 / 552 / 22,055
- Arithmetic checks / exceptions reported in the full pack: 52,793 / 0
- Full review ZIP SHA-256: `c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6` (MATCH)
- Checked-in tier file SHA-256: `99a83b35f8d5e71c7249a70db6c8b7fb71d2f2f1f5a6234eeec8fd3a17a2e89a` (pack `schemas/atlas/tiers/germany.json`, included as supplied)
- Predecessor `data/draft-tiers.jsonl` SHA-256 (full-pack manifest; file omitted from this land): `0f27312e722d89f7dee08543febf8eeacde0e953b82c5a78a6564ccadd0a5806`
- Landed from main `bee1215e74e57609b15aed1c9788715ff15b0be1` (Luxembourg Prompt AO #70). Existing country lines on the shared indexes are retained

## Land slim notes
- Docs and tiers only. No `data/research/germany/` register, events, or results in this land
- `sources/`, `results.jsonl`, `events.jsonl`, reporting units, and other bulky dumps omitted. `docs/phase1/germany/SHA256SUMS` is the full-pack manifest, including omitted paths
- `metadata.json` and `Justin_Report.md` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`, `research_coverage_complete=false`
- Per-office `justin_approved` stays false and per-office `review_status` stays `draft_unapproved` in the included tier file. File-level acceptance is this receipt, with DE-G01–DE-G23 open

## Out of scope this land
- Germany `import:atlas` importer (no `lib/atlas/germany/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=germany` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
