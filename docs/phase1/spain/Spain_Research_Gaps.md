# Spain research gaps and named holds

DRAFT. All Justin decisions remain unchecked. These are substantive research gates, not optional implementation tests. Current territorial coverage does not establish complete institutional or historic coverage.

## ES-G01 — Current municipal ballot modes

3,762 current and 4 historical municipal representation mandates retain mode_pending; 78 explicit 2023 concejo abierto direct-alcalde records require 2026 continuity confirmation. Their territorial existence is evidenced, but institutional-mode completeness is not claimed.

Required evidence/decision: Resolve with current official municipal mode register/legal resolutions and original election records; never add a second generic mayor.

Exact inventory: `human-review.json; office-register.json /holds`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G02 — Scanned municipal results and extraction coverage

2023 PDFs include scan-only returns. 2015/2019 text extraction is broader but still has missing/unbound/continued tables; all originals and extraction audit retained.

Required evidence/decision: Transcribe/verify pages or acquire official machine-readable Ministry transfer. Cross-check complete candidate vectors and totals before certification.

Exact inventory: `municipal-extraction-audit.json; unbound-municipal-blocks.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G03 — Corrections and conflicting originals

Later official correction notices retained. Two distinct original blocks bind to ES-M31243-REP (2015) and ES-M46019-REP (2015); events and four transcribed result rows are disputed.

Required evidence/decision: Resolve exact corrective act and retain both original claims plus accepted guarded override; no silent first/last-wins.

Exact inventory: `duplicate-municipal-blocks.json; result-publication-bindings.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G04 — Regional, Senate, foral and island numeric depth

Dated institutional histories retained back to available JEC indexes. Many official numeric PDFs are retained but not normalized. Senate candidate marks differ from list votes and autonomous designation is separate.

Required evidence/decision: Transcribe official constituency/candidate returns, distinguish popular Senate seats from autonomous designations, reconcile corrections; no candidate-mark denominator invention.

Exact inventory: `result-publication-bindings.json; sources.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G05 — Provincial indirect bodies

38 FEMP provincial institutions included with LOREG indirect mode. No dated provincial constitution/event/result is inferred from municipal election dates.

Required evidence/decision: Official provincial constitution minutes and indirect election returns; verify current government register when REL access is available.

Exact inventory: `office-register.json office_type=provincial_council`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G06 — Historic municipal changes

Four absent current codes retained from prior INE snapshots: 15026, 15063, 36011, 36012. Pre-2001 snapshots and all legal effective dates/successor bindings are incomplete.

Required evidence/decision: INE/BOE legal acts for each change. No guessed edges to current combined names/codes.

Exact inventory: `register-source-rows.json; geography.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G07 — Special territorial regimes

Ceuta/Melilla and Formentera proposed other and appear once; Aran other. Navarra Parliament appears once without generic provincial duplicate. Basque elected Juntas are distinct from executive Diputaciones.

Required evidence/decision: Justin explicit tier policy acceptance and current statute reconciliation; no invented direct regional/island presidents.

Exact inventory: `human-review.json; tier rules ES-T3`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G08 — Island source currency

INE island workbook URL uses 26 but internal heading says 2025. Eleven islands identified; Formentera combines municipal and island body, leaving ten additional island offices.

Required evidence/decision: Confirm current island correspondence against updated INE/territory-wide source; retain both source labels.

Exact inventory: `26codislas.xlsx; 10 island-office holds`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G09 — Upcoming calendar and alert scope

All next_date values are unknown in this revision; none are fabricated from ordinary terms. 2026-09-08–2028-03-08 filters alerts only.

Required evidence/decision: Use official calls or clearly qualified statutory/expected metadata, never silently add a polling day. Keep office and history regardless.

Exact inventory: `country.json /next_election_policy`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G10 — Submunicipal and special district universe

6,708 source blocks explicitly labelled submunicipal are retained separately; 158 further blocks lack unique exact INE municipal binding. They are not discarded, merged by fuzzy name, or asserted as municipal council events. Madrid/Barcelona district bodies are not registered as direct offices without institutional evidence.

Required evidence/decision: Acquire a clean body/register/mode scope and primary electoral footing before additional offices; bind each retained return exactly.

Exact inventory: `unbound-municipal-blocks.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G11 — Source acquisition

Infoelectoral/Ministry download attempts returned service errors; official REL register endpoint returned access denial. No bypass attempted; original JEC/INE/BOE/FEMP sources used.

Required evidence/decision: Retry supported official feeds through normal access, verify hashes and reconcile with originals. Failed URL is not a successful source row.

Exact inventory: `source-acquisition-gaps.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.

## ES-G12 — Result interpretation

All share fields remain unknown, no margins/winners inferred. Blank seats are NULL; printed zero stays zero. Candidate/list strings retain extraction orthography and need transcription review.

Required evidence/decision: Verify complete ballot basis, candidate versus list scope and original/corrected publication before producing derived margins or final result claims.

Exact inventory: `results.json; municipal-source-blocks.jsonl.gz; national-source-results.json`.

- [ ] Justin accepts a documented resolution.
- [ ] Justin amends or keeps this gate open.
