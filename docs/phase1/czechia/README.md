# Czechia full register — Prompt V / APPROVED

**6,411 current + 13 historical offices; 46,236 events; 169,614 result rows.** Draft tiers: 6,257 municipal, 14 regional, 3 national, 150 other. Main pin `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. Research capture 2026-09-20.

Start: docs/phase1/czechia/Czechia_Full_Register_Report.md. Data: data/research/czechia/. Tiers: schemas/atlas/tiers/czechia.json (**approved**, production_accepted). President is the only direct executive; direct local executives 0; 6,420 council/assembly offices retained. Prague dual-status, historical code binding, military–civilian transitions, municipal share semantics, EP party scope, and next-cycle dates remain named holds. Historical codes retained with no invented successors. The alert window never prunes offices/history.

History is qualified: volby.gov.cz-backed national/local returns plus prospective cycle metadata. MUNICIPAL-RECALCULATED-PERCENT, CURRENT-ROSTER-VALIDITY, EXECUTIVE-MODE, HISTORIC-DEPTH, LEGAL-OUTCOME-REPEAT-AUDIT and DATES-AND-NEXT-CYCLES remain open. Missing XML seats stay NULL. Nine not-held zero placeholders remain retained-only.

Mapping is **Done**. The Atlas importer is **landed** (`ATLAS_IMPORT_SCOPE=czechia`); see [Czechia_Import.md](Czechia_Import.md). The slim git land omits `results.jsonl.gz`, identity-vector blobs, and raw `sources/`; `events.json` is carried as `events.json.gz` only. The importer does not invent those omitted result rows. No VPS deploy in the importer PR. PASS does not mean complete research or permission to publish.

- [x] Justin accepts register and historical qualifications (2026-09-20, with named holds).
- [x] Justin accepts draft tiers (2026-09-20; named holds retained).
- [x] Justin accepts the named research holds (2026-09-20).
