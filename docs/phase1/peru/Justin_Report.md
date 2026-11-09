# Justin — Peru Prompt BK return

Research/documentation only. Snapshot **31 October 2026**. **`applied_changes=0`**. All approvals remain unchecked; no importer/SQLite/VPS/UI/repository changes.

**Coverage dates:** calendar checked to **31 October 2026**; full municipal roster reconciled to INEI’s **14 October 2026** workbook; normalized historical event/result data retained from **30 September 2026**. The 4 October 2026 poll is now a past comparable contest. Its detailed results are **not transcribed** here, and are never represented as zero or certified by inference.

**3,840 current office rows: 3,838 research accepted + 2 held; 1 historical office row.** These are body/ticket identities, not individual seats or approved production rows. The 27 vice-executive ticket components (2 national, 25 regional) are explicit in `ticket_components.json` and are not independent ballot offices.

| Layer | Current research accepted | Current held |
|---|---:|---:|
| national | 4 | 0 |
| regional | 50 | 0 |
| provincial_municipal | 392 | 0 |
| district_municipal | 3392 | 2 |

Accepted executive offices/tickets: **1,918**. Accepted regional/municipal councils: **1,917**. Other accepted bodies: **2 national chambers + 1 Andean delegation**. Sangani contributes **1 held mayor + 1 held council**.

**12,460 documentary events; 97,260 result observations** across **76 source-defined process groups**. Of these, **6 event segments / 197 observations** are transcribed from 2026 JNE proclamations. Senate national and multiple-district ballots are separate event segments. Other historical results are official ONPE open-data aggregates; their JNE certification is not inferred. `108` result rows have missing/incomplete votes and retain observed sums without converting missing cells to zero.

Draft tiers (1:1 with all office rows): `{"municipal": 3786, "national_context": 5, "regional": 50}`. Every tier is `needs_review` and every approval is false. EP=0; MERCOSUR=0; Parlamento Andino=1 current popular delegation body (5 titular seats, 10 alternates).


## Upcoming elections

**Every next ordinary contest family must appear prominently on the Peru country surface, including the 2030 regional/municipal and 2031 national cycles outside the approximately 18-month alert window. That window filters only global homepage items and alerts. It never suppresses Peru’s offices, history, or country calendar.**

| Office / contest family | Next date or formula | Status | Last comparable contest | Source |
|---|---|---|---|---|
| President + two Vice Presidents on one ticket — first round | Second Sunday of April 2031; formal convocatoria pending | constitutional/statutory formula | 12 April 2026, with limited 13 April extension | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Presidential second round, if required | Within 30 days after official first-round proclamation in the 2031 cycle; no day called | constitutional/statutory formula; conditional | 7 June 2026 | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Senado | Second Sunday of April 2031; formal convocatoria pending | constitutional/statutory formula | 12 April 2026, with limited extension | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Cámara de Diputados | Second Sunday of April 2031; formal convocatoria pending | constitutional/statutory formula | 12 April 2026, with limited extension | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Peruvian representatives to Parlamento Andino | Second Sunday of April 2031; formal convocatoria pending | constitutional/statutory formula | 12 April 2026, with limited extension | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| 25 Gobernadores + Vicegobernadores — joint regional tickets | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| Regional executive second round, where required | 6 December 2026, where required; JNE date fixed, formal executive convocatoria and participating-region list not verified in retained evidence | official JNE agreement / schedule; executive call verification hold | 4 December 2022 | [JNE agreement](https://busquedas.elperuano.pe/dispositivo/NL/2563351-1) |
| 25 Consejos Regionales | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| 196 provincial alcaldes | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| 196 provincial concejos / regidores | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| District alcaldes (1,696 municipalities in 2026 election scope) | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| District concejos / regidores (1,696 municipalities in 2026 election scope) | First Sunday of October 2030; formal convocatoria and cycle-specific eligibility roster pending | constitutional/statutory formula | 4 October 2026; results not normalized in this pack | [JNE / law](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1) |
| Sangani district mayor and council — first election | No date established in retained evidence | research hold | None established; district created July 2026 | [Law / source](https://busquedas.elperuano.pe/api/visor_html/2535522-1) |
| Early Chamber of Deputies election after constitutional dissolution | Conditional election within four months of dissolution decree; no trigger/date asserted | research hold — constitutional contingency | 26 January 2020 extraordinary unicameral election; different chamber era | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Presidential vacancy / succession / exceptional general call | Succession first; immediate call by Congress president only in the art.115 permanent-impediment case; no date asserted | research hold — constitutional contingency | 2026 ordinary presidential rounds; no equivalence to a vacancy election asserted | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Annulment / complementary / repeat local contests | No new date established; retain any future JNE decision and call separately | research hold | Official ONPE complementary datasets 2023,2024,2025; Pion remains an INEI pending-election note | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Formal national / regional primaries | Next-cycle schedule not established; 2025/2026 transitional dates are not a perpetual rule | research hold — peer-pack treatment and next-call verification | National:30 November / 7 December 2025; regional-local:17 / 24 May 2026 | [Law / source](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687) |
| Centros poblados — submunicipal policy context | 1 November 2026; official national timetable; municipality-level eligibility/call reconciliation and Atlas submunicipal scope remain held | official ONPE/JNE timetable; submunicipal scope hold | Previous comparable exact date untranscribed | [Official act](https://busquedas.elperuano.pe/dispositivo/EX/2569727-1) |

Source-cited legal basis: [ONPE Compendio 2026](https://cdn.www.gob.pe/uploads/document/file/10195546/3957320-compendio-electoral-peruano-2026-2da-edicion.pdf?v=1782226687), [official 4 October 2026 call](https://www.gob.pe/institucion/presidencia/noticias/1328896-gobierno-convoco-elecciones-regionales-y-municipales-para-el-domingo-4-de-octubre), [JNE presidential first round](https://portal.jne.gob.pe/portal_documentos/files/325d180f-68a4-49d2-8fd3-c8d8a1e67b9f.pdf), [JNE runoff return](https://busquedas.elperuano.pe/api/visor_html/2531916-1), [INEI current roster](https://cdn.www.gob.pe/uploads/document/file/4147047/3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-setiembre-2026.xlsx?v=1789161036), [Law 32729](https://busquedas.elperuano.pe/api/visor_html/2535522-1). The dedicated calendar supplies article-level locators, last-comparable dates and formal-call status.

## Review points

The full territorial register is represented, including Sangani’s 2 held rows. The accepted 2026 municipal scope contains **3,784 municipal office bodies**, comprising 392 provincial and 3,392 district rows. The 25 regional executive tickets explicitly include vicegovernors; 25 regional councils are directly elected. National president/VPs are one popular ticket. Parliament is bicameral from 2026, with unicameral Congress retained as historical only. Parlamento Andino is popular; EP and MERCOSUR rows are zero.

The 2026 official-gazette presidential return resolves a 27-vote arithmetic discrepancy caused by transposed null-vote digits in a JNE news release. A gov.pe download labeled 1625 contains 1610; both source identity issues are documented. Old 2001 catalog links duplicate 2000 bytes and are quarantined rather than assigned invented 2001 results. The historical files and audit show every remaining qualification.

`research_coverage_complete=false`: a full current register is not a claim of complete historical certification. No successor edges are emitted. Validation and checksums make the pack reviewable; they do not authorize application changes.

- [ ] Scope / full inventory approved by Justin.
- [ ] Office identities and ticket representation approved by Justin.
- [ ] Draft tiers approved by Justin.
- [ ] Historical results and remaining holds approved by Justin.
- [ ] Upcoming calendar approved by Justin.
- [ ] Any future importer or production action approved by Justin.


Calendar/roster refresh evidence: [JNE 7 October 2026 agreement](https://busquedas.elperuano.pe/dispositivo/NL/2563351-1), [regional/local statutory schedule](https://busquedas.elperuano.pe/dispositivo/NL/2464390-1), [centros poblados official act](https://busquedas.elperuano.pe/dispositivo/EX/2569727-1), [INEI 14 October 2026 workbook](https://cdn.www.gob.pe/uploads/document/file/4147047/3908763-directorio-nacional-de-municipalidades-provinciales-y-distritales-octubre-2026.xlsx?v=1792100251). The roster has **no added or removed municipality identities**; Sangani remains held. Future 2030 municipality counts are not frozen to the 2026 electoral roster. See `Recovery_and_Refresh.md`.
