# Romania full register — Prompt AL / APPROVED WITH HOLDS

**6,460 current + 0 historical-only offices; 19,343 events; 23 national/EP result rows.** Draft tiers: 6,372 municipal / 84 regional / 3 national / 1 other. Landed from main `1729e321ab31a5922d8ef7fb66236319511ddeda`. Justin accepted 2026-09-22 (America/Edmonton) with named holds left open.

Start: [Romania_Full_Register_Report.md](Romania_Full_Register_Report.md). Data: `data/research/romania/`. Tiers: `schemas/atlas/tiers/romania.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 3,180 ordinary local UAT council/mayor pairs, 41 județ councils, 41 county presidents, Bucharest General Council, the Bucharest general mayor, six sector council/mayor pairs, Camera Deputaților, Senat, the popularly elected president, and the Romania EP delegation. Councils/assemblies: 3,230. Direct executives: 3,229. No prefect, prime minister, or cabinet office is invented. No successor or merger edges are asserted. Zero historical-only offices is not proof that no body was abolished (RO-G06).

Named holds stay open: RO-G01, RO-G02, RO-G03, RO-G04, RO-G05, RO-G06, and RO-G07. Missing local results stay absent (RO-G01). County presidents are marked direct for current law; 2016 was council investiture and has no popular-election event (RO-G03). `RO-PRES-2024-R1` stays annulled with no successor edge to 2025 (RO-G02). EP stays drafted `other` with `direct_election=false` as supplied (RO-G05). Bucharest sector identifiers stay unreconciled across cycles (RO-G04).

`applied_changes=0` for importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. `docs/phase1/romania/validation.json` is the pre-acceptance PASS receipt. `docs/phase1/romania/SHA256SUMS` is the review-pack manifest. `validate.py` expects the pack root and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted local vectors. PASS does not mean complete research or permission to publish.

Approved tier bytes: `0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04` (predecessor draft `eb64c80668c2f079f33bbfeee765aa63948143f4d273371caa3e35a52ee005ce`). Full review ZIP SHA-256 `4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` (2026-09-22; RO-G05 retained).
- [x] Justin accepts the named research holds as open (2026-09-22).
- [ ] Justin separately authorizes implementation.
