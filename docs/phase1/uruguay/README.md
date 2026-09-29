# Uruguay — Prompt BF research pack

Research snapshot: 2026-09-29 UTC. **`applied_changes=0`; all Justin approvals unchecked.** Uruguay research coverage is rescoped from `screened_out` to a full current office register plus a sourced historical archive and country-level upcoming calendar. No importer, SQLite, VPS, UI or repository state was changed.

**314 current offices + 24 historical-only bodies; 1,451 office-level held-event rows; 4,328 result rows.** Current-office coverage is complete for the BF enumerated scope. Historical numerical coverage remains source-limited and is explicitly marked incomplete, with 22 research gates. This is a reviewable research pack, not an approved production release.

## Upcoming elections

**These ordinary dates must appear prominently on the Uruguay country surface even outside the approximately 18-month global homepage/alert window.** The old `screened_out` continuity filter is rescinded for Uruguay research coverage. This pack documents that requirement; no surface, importer or production flag has been changed.

The source-supported formulas and next occurrence years are recorded below. Exact upcoming days remain null. A formal 2029–2030 Corte Electoral convocatoria was not found in the retrieved material and remains pending. National 2029 is derived from the five-year constitutional cycle following 2024; the Corte’s current registration guidance explicitly identifies the second Sunday of May 2030 for the next departmental election.

| Office family / contest | Next ordinary date formula + year | Basis / convocatoria | Last comparable contest | Sources |
|---|---|---|---|---|
| President + Vice President: national first round | Last Sunday of October, **2029** | Constitutional/statutory formula; formal convocatoria pending | 2024-10-27 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77) |
| Cámara de Senadores | Last Sunday of October, **2029** | Constitutional/statutory formula; formal convocatoria pending | 2024-10-27 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77) |
| Cámara de Representantes | Last Sunday of October, **2029** | Constitutional/statutory formula; formal convocatoria pending | 2024-10-27 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77) |
| President + Vice President: conditional balotaje | Last Sunday of November, **2029** — only if required | Constitutional/statutory formula; formal convocatoria pending | 2024-11-24 | [constitution-151](https://www.impo.com.uy/bases/constitucion/1967-1967/151) |
| Intendentes: all 19 departments | Second Sunday of May in the year following the national election, **2030** | Constitutional/statutory formula; formal convocatoria pending | 2025-05-11 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [register-2029-2030](https://www.gub.uy/tramites/credencial-civica-primera-vez?min=true) |
| Juntas Departamentales: all 19 departments | Second Sunday of May in the year following the national election, **2030** | Constitutional/statutory formula; formal convocatoria pending | 2025-05-11 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [register-2029-2030](https://www.gub.uy/tramites/credencial-civica-primera-vez?min=true) |
| Municipal councils: all 136 current municipios | Second Sunday of May in the year following the national election, **2030** | Constitutional/statutory formula; formal convocatoria pending | 2025-05-11 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [register-2029-2030](https://www.gub.uy/tramites/credencial-civica-primera-vez?min=true) |
| Alcaldes: same municipal list contest, all 136 current municipios | Second Sunday of May in the year following the national election, **2030** | Constitutional/statutory formula; formal convocatoria pending | 2025-05-11 | [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [register-2029-2030](https://www.gub.uy/tramites/credencial-civica-primera-vez?min=true) |

Article 151 requires an **absolute majority of voters**, not merely a majority of valid party votes. If no ticket reaches that threshold, the top two joint President/Vice President tickets contest the November runoff. It is not an automatic second poll. The Vice President has no separate ballot. Alcaldes are selected by the municipal list outcome under Article 11 of Law 19.272; there is no additional municipal executive ballot.

The last comparable dates are listed by the [Corte Electoral’s 2024–2025 cycle publication](https://www.gub.uy/corte-electoral/comunicacion/publicaciones/elecciones-del-periodo-electoral-2024-2025). The current [Corte FAQ](https://www.gub.uy/corte-electoral/institucional/preguntas-frecuentes) also mentions 12 May 2030 as voter-registration guidance; this is not treated as a formal convocatoria. The normalized upcoming calendar deliberately uses the requested formula + year convention. Future creation or boundary changes require a fresh inventory check before the 2030 cycle; no new future municipio is guessed.

`data/upcoming-calendar.jsonl` links these eight family entries to every current office. The entries are not counted as held events or results. Every entry has `must_surface_prominently_on_country_surface=true`, `excluded_by_alert_window=false`, `exact_date=null`, and `applied=false`.

## Register and count interpretation

|Scope|Current offices|Historical-only|Current composition|
|---|---: |---: |---|
|National|4|2|President, Vice President, Senate, Representatives|
|Departmental|38|19|19 Intendentes + 19 Juntas Departamentales|
|Municipal|272|3|136 councils + 136 alcalde roles|
|Total|314|24|338 office rows|

Current popular executive roles: 157, comprising 21 national/departmental direct posts and 136 alcaldes determined by the popular municipal list result. Councils: 155; national chambers: 2. Historical composition: 21 collective executives and 3 elected local juntas. **EP offices=0; MERCOSUR offices=0.** Draft tier histogram, including history: national 6 / regional 57 / local 275; current-only: national 4 / regional 38 / local 272. Every office has exactly one unapproved draft classification.

Office/event/result rows are documentary records, not unique voter totals or seat totals. President/VP and council/alcalde share ballots. Current national lemas co-elect chambers and the presidential ticket. Sum only within a specified event and result basis; never across shared-ballot office rows. A municipal council’s 5 seats include the alcalde. Geographic nesting is not succession. There are zero guessed successor edges.

## Evidence and coverage

The current inventory is grounded in [Corte Circular 12208](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-03/Circular-12208-Municipios-Elecciones-Departamentales-2025..pdf), the [municipal law](https://www.impo.com.uy/bases/leyes/19272-2014), 2025 official return groups and [OPP’s confirmation of 19 departments and 136 municipios](https://opp.gub.uy/es/noticias/asuncion-de-nuevas-autoridades-departamentales-y-municipales). Original raw responses, URLs, retrieval dates and source hashes are retained. Full signed 2025 departmental and municipal proclamations are included for all 19 departments.

Read [history-coverage.md](history-coverage.md) and [research-gaps.md](research-gaps.md) before interpreting results. Historic candidate, seat and exception transcription is not complete. Official publication, a certified source, a post-election holder roster and a draft OCR transcription are different evidence states. Missing numbers are null; explicit source zeros are preserved. Source defects are retained and explained, including 1954/1962 ambiguities, 1994 conflicts, 2009 wrong headings, 2020 postponement and source-label corrections. All shares are null rather than derived without a verified denominator.

## Contents and validation

- `data/office-register.jsonl`, `draft-tiers.jsonl`, `events.jsonl`, `results.jsonl`: office and electoral research rows.
- `data/municipal-register.jsonl`, `geography.jsonl`, `identity-crosswalk.jsonl`, `evidence-links.jsonl`: official-inventory reconciliation and provenance.
- `Uruguay_Upcoming_Elections.md`, `data/upcoming-calendar.jsonl`: prominent ordinary calendar, formulas and pending convocatoria status.
- `identity-rules.md`, `research-gaps.md/json`, `history-coverage.md`: identity gates, modes and coverage limits.
- `contracts/columns.json`, `field-map-223.md/json`: inherited 223-field / 20-table contract, one mapping per field, with no executable importer.
- `sources/source-inventory.jsonl`, `sources/raw/`, `sources/web/`, `sources/extracted/`: hashed evidence and clearly distinguished extraction aids.
- `acceptance-examples.md/json`: 40 acceptance examples; `validate.py`, `validation-report.json`, `SHA256SUMS`: offline integrity and guardrails.
- `Justin-report.md`, `manifest.json`, `counts.json`: review summary, controls and counts.

Run `python3 validate.py` from the extracted pack or pass the pack directory as its sole argument. It only reads the pack and prints a report; no network, database, shell side effects or application writes. `SHA256SUMS` covers every packaged file except itself. ZIP SHA-256 is supplied outside the ZIP to avoid circular hashing. A passing report establishes internal consistency and evidence retention, not Justin approval or exhaustive historical certification.

## Justin approval

- [ ] Approve office register and identity rules
- [ ] Approve historical coverage and unresolved research holds
- [ ] Approve draft tiers
- [ ] Approve prominent country upcoming-calendar specification
- [ ] Approve any future importer / database / UI / publication action

No approval is presumed. No future application action is authorized by this documentation.
