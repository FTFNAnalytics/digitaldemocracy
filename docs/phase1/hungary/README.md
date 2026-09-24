# Hungary full register — Prompt AK / APPROVED WITH HOLDS

**6,378 current + 0 historical-only offices; 12,753 events; 101,526 result rows (review ZIP).** Draft tiers: 6,355 municipal / 20 regional / 2 national / 1 other. Pack pin `3b21c584c1b59663c5c4ae1bad775618293ac0fa`. Landed on main `c621591717e8476e06e3a76cc60bfa29aab7fc0d`. Justin accepted 2026-09-22 (America/Edmonton) with named holds left open.

Start: [Hungary_Full_Register_Report.md](Hungary_Full_Register_Report.md). Data: `data/research/hungary/`. Tiers: `schemas/atlas/tiers/hungary.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 3,177 municipal/district councils, 3,177 direct municipal/district mayors, 19 county assemblies, one Budapest capital assembly, one direct capital mayor, Országgyűlés, an indirect presidency, and the Hungary EP delegation. Direct mayors: 3,178. Councils/assemblies: 3,198. No PM/cabinet, direct county chair, or járás council is invented. `successor-crosswalk.json` is empty. Zero recovered historical-only offices is not proof that no body was abolished (HU-HISTORICAL-REFORMS).

Named holds stay open: HU-CURRENT-LEGAL-REGISTER, HU-HISTORICAL-REFORMS, HU-2019-ARCHIVE, HU-SPECIAL-REPEAT, HU-BUDAPEST, HU-PRESIDENT, HU-NATIONAL-COMPONENTS, HU-EP, HU-NATIONALITY-SELF-GOVERNMENT, HU-MUNICIPAL-SEATS, HU-CHAIRS-JARAS (documented exclusion), and HU-UPCOMING. Budapest capital assembly stays drafted regional and the capital mayor stays drafted municipal (HU-BUDAPEST). EP stays drafted `other` (HU-EP). Bozsok council/mayor and Pakod council 2024 return gaps stay open; offices retained; no zero invented.

The accept-with-holds land kept `applied_changes=0` and did not run the importer. The follow-up importer is `ATLAS_IMPORT_SCOPE=hungary` — see [Hungary_Import.md](Hungary_Import.md). It publishes 6,378 current + 0 historical offices and 0 result rows (the omitted 101,526-row `results.json` is not invented) and leaves the named holds open. `ATLAS_IMPORT_SCOPE=all` does not import Hungary. VPS deploy is out of scope. Land PR omits `results.json`, identity vectors, raw `sources/`, and `contract-reference/` bytes (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `docs/phase1/hungary/validation.json` is the pre-acceptance PASS receipt. `validate.py` is the full review-pack validator: it expects the pack root (including omitted results, identity vectors, sources, and contract-reference SQL) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `3be45f777e8c3c5bcbd02825a18f4cd327c2b31478753b6863de48799dcec9cd` (predecessor draft `fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a`). Full review ZIP SHA-256 `03b497b92937719a2bf6e58324910aa68cdf2fbdb497203f617482bbec3bd074`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including Budapest and EP as drafted (2026-09-22; HU-BUDAPEST and HU-EP retained).
- [x] Justin accepts the named research holds as open (2026-09-22).
- [ ] Justin separately authorizes implementation.
