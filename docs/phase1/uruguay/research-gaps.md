# Uruguay BF — Research gaps and scope gates

All gates are documentary. All Justin approvals remain unchecked. `applied_changes=0`. “Resolved” describes the research rule or source reconciliation; it is not Justin approval.

## UY-BF-G01 — Full municipal inventory by departamento

Status: **resolved_current_inventory_history_boundaries_open**.

Signed Circular 12208 identifies 136 municipios; all match 2025 CEC return groups and OPP’s 2025–2030 count. Department counts are in counts.json and municipal-register.jsonl. Historical return inventories reconcile to 89/112/125/136 in 2010/2015/2020/2025. First evidenced election is not the creation date.

Required rule / remaining work: Recheck dated creation/boundary acts for any changes after the evidenced cycle; do not project present units into past years.

Sources: [municipal-annex](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-03/Circular-12208-Municipios-Elecciones-Departamentales-2025..pdf), [OPP-2025](https://opp.gub.uy/es/noticias/asuncion-de-nuevas-autoridades-departamentales-y-municipales), [92d7ca7b-32f1-4cde-b607-d94aef825c4d](https://catalogodatos.gub.uy/dataset/2d5eb299-0d95-478b-9271-c62f601e7bc1/resource/92d7ca7b-32f1-4cde-b607-d94aef825c4d/download/desglose-de-votos.csv)

- [ ] Justin approval

## UY-BF-G02 — Alcalde versus concejal selection

Status: **resolved_rule_exception_documented**.

Law 19.272 arts. 9 and 11: five elected members; first titular of the most-voted list of the most-voted lema is alcalde; four others are concejales. Not council-selected; not a separately voted executive. Substitution and statutory tie rules matter.

Required rule / remaining work: Retain two office roles per municipio with one shared ballot group; never six seats or fabricated personal votes.

Sources: [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [procl-108](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-08/Canelones%20-%20Actas%20de%20proclamaci%C3%B3n%20%28Parte%202%29.pdf)

- [ ] Justin approval

## UY-BF-G03 — Localities outside a municipio

Status: **open_exhaustive_locality_inventory**.

Art.8 explicitly permits departmental administration of territory with no municipio. The 136 elected units are complete for the signed election annex; an exhaustive census of all non-municipalized localities is not supplied.

Required rule / remaining work: Do not create municipio offices merely because a settlement, department capital, population threshold or GIS point exists.

Sources: [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [municipal-annex](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-03/Circular-12208-Municipios-Elecciones-Departamentales-2025..pdf)

- [ ] Justin approval

## UY-BF-G04 — Balotaje, co-election and majority denominator

Status: **resolved_current_rule_history_transcription_open**.

President and Vice President are jointly and directly elected; absolute majority of voters; top-two runoff on the last Sunday in November if necessary. Actual 1999/2009/2014/2019/2024 runoffs are distinct from first rounds. No 2004 runoff is invented.

Required rule / remaining work: Keep joint-ticket totals in the President event and link the VP event; do not sum shared ballot votes across offices.

Sources: [constitution-151](https://www.impo.com.uy/bases/constitucion/1967-1967/151), [arc-55c8770e1855](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-04/Elecciones%2BNacionales%2B2004.pdf), [national-e8d3892617](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-12/Acta%2010762%20-%20Proclamaci%C3%B3n%20Presidente%20-%20Vicepresidenta%202025-2030.pdf)

- [ ] Justin approval

## UY-BF-G05 — Internas / formal party primaries

Status: **excluded_pending_peer_pack_policy**.

Corte publication lists formal internas on 30 June 2024. The user conditions inclusion on peer-pack policy; no available prior-context evidence established that condition. Internas therefore have no office, event or result rows in this pack. This is a scope choice, not a denial that the formal contests exist.

Required rule / remaining work: If Justin later establishes the peer policy, add documentary primary contests with sourced dates, without inventing party-organ public offices. Internas are contextual, outside the eight in-scope ordinary calendar family rows.

Sources: [cycles-2024-2025](https://www.gub.uy/corte-electoral/comunicacion/publicaciones/elecciones-del-periodo-electoral-2024-2025)

- [ ] Justin approval

## UY-BF-G06 — Calendar beyond 18 months / Uruguay rescope

Status: **resolved_documentation_only**.

Next ordinary national cycle is 2029, local cycle 2030, with conditional 2029 runoff. These remain first-class country-calendar entries despite falling beyond the global 18-month alert horizon. Uruguay is no longer screened_out in this research pack for lack of a near-term election.

Required rule / remaining work: Prominent country-calendar display is documented, not implemented. Formal convocatoria pending; exact dates null; no production coverage flip performed.

Sources: [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [constitution-151](https://www.impo.com.uy/bases/constitucion/1967-1967/151), [register-2029-2030](https://www.gub.uy/tramites/credencial-civica-primera-vez?min=true)

- [ ] Justin approval

## UY-BF-G07 — European Parliament and regional exclusions

Status: **resolved_scope**.

EP offices=0. Uruguay is not an EU Member State. No MERCOSUR / regional parliament, regional government above departamento, cabinet, minister or party-organization office rows are invented. Juntas Electorales appearing in archival data are election-administration bodies outside BF’s enumerated jurisdictional-government scope; their figures are not mislabeled as Juntas Departamentales.

Required rule / remaining work: Maintain zero EP and MERCOSUR office counts; do not silently expand the specified office families.

Sources: [constitutional-eras](https://pxserver6.parlamento.gub.uy/Constitucion/), [cycles-2024-2025](https://www.gub.uy/corte-electoral/comunicacion/publicaciones/elecciones-del-periodo-electoral-2024-2025)

- [ ] Justin approval

## UY-BF-G08 — Constitutional eras 1918 / 1934 / 1942 / 1952 / 1967 / 1997

Status: **partly_transcribed_historical_hold**.

Parliament’s constitutional history identifies the 1918 President + Consejo Nacional de Administración arrangement; 1934 single executive changes; 1942 Senate representation changes; 1952 national and departmental collegiate executives; 1967 restoration of President/VP and Intendentes; and the 1996 plebiscite / 1997 reform gate. Current runoff and seat rules are not back-projected. Twenty-one historical collective executive bodies are retained. Colonial/pre-independence institutions are excluded.

Required rule / remaining work: Historic CNA poll series, earlier constitutional cycles and exact term boundaries remain untranscribed. No guessed predecessor/successor edges. Do not invent President/VP popular contests during the 1952 collegiate era.

Sources: [constitutional-eras](https://pxserver6.parlamento.gub.uy/Constitucion/), [arc-c677795df98c](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecciones%C2%A0Nacionales%C2%A0de%C2%A01954.-.pdf), [arc-bf3038b928c8](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Eleccion%20Nacional%201962.xlsx), [arc-f9872f8b1155](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecciones%C2%A0Departamentales%C2%A0de%C2%A01954.pdf), [arc-73c9760b3080](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecc_Departamental_1962.pdf)

- [ ] Justin approval

## UY-BF-G09 — Municipalization and later expansions

Status: **resolved_observed_poll_inventory_legal_creation_dates_open**.

Law 18.567 and Law 18.653 establish the 2009–2010 gate; Law 19.272 governs the current system. Election return groups establish 89/112/125/136 observed municipal electorates. Three older elected Juntas Locales are source-identified separately.

Required rule / remaining work: Do not assign legal creation dates from the first observed vote year. Do not infer merger edges from an identical place name.

Sources: [law-18567](https://www.impo.com.uy/bases/leyes/18567-2009), [law-18653](https://www.impo.com.uy/bases/leyes/18653-2010), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014), [arc-266479fd2bba](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-04/Elecciones_departamentales_2010.pdf), [arc-8a7955f8a8b8](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Deptales%202015.xlsx)

- [ ] Justin approval

## UY-BF-G10 — Concurrent versus staggered calendars / 2020 exception

Status: **resolved_rule**.

Earlier national and departmental archive contests are concurrent. Modern ordinary departmental/municipal contests fall in May following the national year. Law 19.875 and Circular 10853 postponed 10 May 2020 to 27 September 2020.

Required rule / remaining work: The original scheduled date is a deferred-calendar hold, not a held zero-vote event. Counts include only the actual September 2020 election.

Sources: [constitution-77](https://www.impo.com.uy/bases/constitucion/1967-1967/77), [law-19875](https://www.impo.com.uy/bases/leyes/19875-2020), [circular-10853](https://www.impo.com.uy/bases/circulares-corte-electoral/10853-2020)

- [ ] Justin approval

## UY-BF-G11 — Annulment / repeat / replacement and San Bautista tie

Status: **partly_documented_exception_coverage_open**.

San Bautista’s 2025 alcalde proclamation explicitly refers to a 21 May 2025 draw, Acta 21. That is an adjudication, not a repeat vote. Historical Intendente tables record deaths/resignations and substitutions; notably Flores 2005 elected Walter Raúl Echeverría García died before taking office, while the row names a replacement.

Required rule / remaining work: No exhaustive national repeat/annulment register was retained. Do not assert that no exceptions ever occurred. Add source-identified annulled/repeated events separately when located; holder replacement alone creates no popular contest.

Sources: [procl-108](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-08/Canelones%20-%20Actas%20de%20proclamaci%C3%B3n%20%28Parte%202%29.pdf), [arc-284e05a07e71](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecc_Departamental_1989.pdf), [arc-a86c030f674d](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-04/eleccion_departamental_2000.pdf), [arc-0d72cd01dcf9](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecc_Departamental_2005.pdf)

- [ ] Justin approval

## UY-BF-G12 — 1954/1962 archival conflicts

Status: **open_numeric_hold**.

1954 national workbook title/date context differs from its section 4 heading stating 1958; national collegiate seat allocation contradicts the party vote narrative. Departmental 1954/1962 vote tables contain labeling/column ambiguities. These numeric vote vectors and 1954 CNG allocation are held rather than silently corrected; unambiguous chamber/Junta allocations remain.

Required rule / remaining work: Obtain contemporaneous certified returns before releasing conflicting numerical fields. Archive existence does not confer cell-level certification.

Sources: [arc-c677795df98c](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecciones%C2%A0Nacionales%C2%A0de%C2%A01954.-.pdf), [arc-f9872f8b1155](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecciones%C2%A0Departamentales%C2%A0de%C2%A01954.pdf), [arc-73c9760b3080](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecc_Departamental_1962.pdf)

- [ ] Justin approval

## UY-BF-G13 — 1994 archive / source disagreement

Status: **open_numeric_hold**.

IPU records the 27 November 1994 election and lower-house32/31/31/5 allocation. Its Senate presentation totals 31, needing separation of elected mandates from ex-officio membership; secondary presidential vote figures also conflict. The pack retains the event context and IPU lower-house seat report, with other numerics held. The original 1967 Constitution arts. 77(9),94 and 151 supports joint popular President/VP and concurrent chambers for that era; it is not used to back-project the current runoff rule.

Required rule / remaining work: Retrieve primary Corte return for candidate formulas, votes and Senate mandates. Do not force a 31-seat report into 30 or treat grouped party data as personal candidate votes.

Sources: [web-1994-2019-history](sources/web/1994-2019-history.json), [web-national-validation](sources/web/national-validation.json), [constitution-1967-original-pdf](https://pxserver6.parlamento.gub.uy/File/biblioteca/Constituciones/1967/1967%20Constitucion%20-%20OCR.pdf)

- [ ] Justin approval

## UY-BF-G14 — 2009 official archive date errors

Status: **resolved_with_independent_primary_dates**.

The summary PDF prints 31 October for the first round and 28 November for the runoff. Circular 8408 identifies 25 October 2009; the official Presidency biography identifies 29 November 2009. Those primary-supported dates are used; the original PDF is retained unchanged.

Required rule / remaining work: Retain the conflicting headings in evidence; never silently propagate them to event dates.

Sources: [arc-0cbcbaa829aa](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Elecciones_Nacionales_2009.pdf), [rules-2009](https://www.impo.com.uy/bases/circulares-corte-electoral/8408-2009/1), [presidency-2009](https://archivo.presidencia.gub.uy/sci/pages/mujica01.htm)

- [ ] Justin approval

## UY-BF-G15 — Current GIS and historical label defects

Status: **resolved_audited_aliases**.

Official map JSON has corrupted accents/names and assigns Atlántida letter C, conflicting with the signed annex’s Ñ. The signed annex controls.2015 summary says Florida “FRAY BENTOS”; the detailed source explicitly says Fray Marcos.2010“CAP.JUAN ARTIGAS” is matched to Barros Blancos using Law 18.136 and the 2010 municipal law, not a merger guess. Salinas 2025: the allocation paragraph prints FRENTE AMPIO for hoja 141-K; the following member proclamation explicitly calls that same list FRENTE AMPLIO. PDF pages 8–9 were visually checked. The raw spelling is retained in the audit; the normalized allocation is Frente Amplio 3, Coalición Republicana 2.

Required rule / remaining work: Preserve source labels and narrowly scoped aliases; no extra Atlántida/Pando or Florida/Fray Bentos offices.

Sources: [municipal-map](https://sit.mvot.gub.uy/arcgis/rest/services/07_EXTERNO/LIMITES_ADMINISTRATIVOS/MapServer/5/query?where=1%3D1&outFields=*&returnGeometry=false&f=pjson), [municipal-annex](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-03/Circular-12208-Municipios-Elecciones-Departamentales-2025..pdf), [arc-8a7955f8a8b8](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Deptales%202015.xlsx), [arc-a13aa51f329a](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-04/resultado_por_crv_municipal_todo_el_pais%20CONVERT%20XLSX.xlsx), [law-18136](https://www.impo.com.uy/bases/leyes/18136-2007), [law-18653](https://www.impo.com.uy/bases/leyes/18653-2010), [procl-108](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-08/Canelones%20-%20Actas%20de%20proclamaci%C3%B3n%20%28Parte%202%29.pdf)

- [ ] Justin approval

## UY-BF-G16 — Nulls / blank source cells / explicit zeros

Status: **resolved_rule**.

2015 Villa del Carmen’s Asamblea Popular cell is blank and stays null. Explicit published zeros in early summary grids are retained as source zeros, without inventing candidate participation. A missing party or untranscribed seat field is not converted to zero.

Required rule / remaining work: Validator rejects null-to-zero coercion; all normalized shares remain null because percentage denominator transcription is incomplete.

Sources: [arc-8a7955f8a8b8](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Deptales%202015.xlsx)

- [ ] Justin approval

## UY-BF-G17 — 2025 candidate-integration resource incomplete

Status: **open_upstream_dataset_hold**.

The retained integration CSV contains 639 rows confined to Artigas/Cabildo Abierto, although its catalogue presentation suggests broader coverage. It is not used as the countrywide winner inventory.

Required rule / remaining work: Use signed proclamations for winners. Do not infer missing offices or candidates from this incomplete resource.

Sources: [7b775c22-3a59-490b-b8a0-6a8f8efd33bc](https://catalogodatos.gub.uy/dataset/2d5eb299-0d95-478b-9271-c62f601e7bc1/resource/7b775c22-3a59-490b-b8a0-6a8f8efd33bc/download/integracion-de-las-hojas-de-votacion.csv), [proclamations-2025](https://www.gub.uy/corte-electoral/comunicacion/comunicados/proclamaciones-elecciones-departamentales-municipales-2025)

- [ ] Justin approval

## UY-BF-G18 — Return stage versus certification / turnout fields

Status: **open_remaining_proclamation_transcription**.

2019/2024 national chamber allocations and 2024 runoff have signed-proclamation evidence. All 32 Canelones 2025 municipal vote vectors reconcile with the signed act. Other published return aggregates are labeled as such; proclamation PDFs for all 19 departments are retained. Some runoff CSV turnout/observed-vote fields reflect mixed processing stages, so no denominator is fabricated.

Required rule / remaining work: Complete all historical certificate/candidate/seat transcriptions before claiming exhaustive certified results. OCR-assisted draft transcriptions are distinguished from source certification.

Sources: [acta-10035-2019](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-07/ACTA_10035_SENADO_2020_2025.pdf), [acta-10037-2019](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-07/ACTA%2B10037%2BCAMARA%2BDE%2BREPRESENTANTES%2B2020%2B2025%2BFIRMADA_compressed.pdf), [national-5e0782cd3f](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-02/ACTA%2010754%20FIRMADA.28112024141122_0.pdf), [national-5028502b52](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2025-02/ACTA%2010755%20FIRMADA_0.pdf), [national-e8d3892617](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2024-12/Acta%2010762%20-%20Proclamaci%C3%B3n%20Presidente%20-%20Vicepresidenta%202025-2030.pdf), [proclamations-2025](https://www.gub.uy/corte-electoral/comunicacion/comunicados/proclamaciones-elecciones-departamentales-municipales-2025)

- [ ] Justin approval

## UY-BF-G19 — Full history versus available archive coverage

Status: **open_explicit_coverage_limit**.

Full current enumerated-office coverage is established. Historic numeric coverage is not exhaustive: 1958 and earlier complete series, 1994 primary returns, many losing-candidate formula totals, detailed council/municipal allocations and exception proceedings remain open. Source-held numeric fields stay null.

Required rule / remaining work: Read history-coverage.md. A passing validator certifies pack consistency and guardrails, not the completeness or legal truth of every historical source.

Sources: [statistics-index](https://www.gub.uy/corte-electoral/datos-y-estadisticas/estadisticas), [constitutional-eras](https://pxserver6.parlamento.gub.uy/Constitucion/)

- [ ] Justin approval

## UY-BF-G20 — Pre-1997 lema / formula comparability

Status: **resolved_model_history_detail_open**.

Before the modern single-ticket and runoff rule, a party could carry several presidential formulas. Lema totals in the pack are labeled as aggregates, not personal candidate votes; 1971 cannot be resolved by simply selecting the candidate with the largest personal total across parties.

Required rule / remaining work: Do not compare pre-1997 party aggregates with runoff candidate shares as though they used one electoral system. Missing formula splits remain untranscribed.

Sources: [arc-fa27692f56c7](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Eleccion_nacional_1971.pdf), [arc-cba96e7ccd03](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Eleccion_Nacional_1989.pdf), [constitution-151](https://www.impo.com.uy/bases/constitucion/1967-1967/151)

- [ ] Justin approval

## UY-BF-G21 — Elected membership versus ex-officio / holder replacement

Status: **resolved_rule**.

Current Senate is 30 elected senators plus the Vice President ex officio. The 1952-era summaries identify 31 elected senators. Municipal councils have five members including the alcalde. Source holder succession is not an additional elected mandate or a new office.

Required rule / remaining work: Keep event-level seat totals by era. Never add the alcalde’s role a second time when totaling council seats.

Sources: [constitution-94](https://www.impo.com.uy/bases/constitucion/1967-1967/94), [arc-bf3038b928c8](https://www.gub.uy/corte-electoral/sites/corte-electoral/files/2023-08/Eleccion%20Nacional%201962.xlsx), [law-19272](https://www.impo.com.uy/bases/leyes/19272-2014)

- [ ] Justin approval

## UY-BF-G22 — 2025 mayor and seat transcription completeness

Status: **open_person_level_transcription**.

All 136 municipal council party vectors and all 19 departmental party vectors are normalized. All 19 proclaimed Intendente winner identities are included; only 53 of 136 alcalde proclamations have normalized winner identities. The full 125 municipio 2020 OPP holder roster is documented as a post-election government roster, not an original Corte certificate.

Required rule / remaining work: Retained original proclamations permit follow-up. Do not label untranscribed winners, votes, seats or substitutes as zero. The office register is complete independently of person-level transcription.

Sources: [proclamations-2025](https://www.gub.uy/corte-electoral/comunicacion/comunicados/proclamaciones-elecciones-departamentales-municipales-2025), [opp-2020-mayors](https://www.opp.gub.uy/es/noticias/alcaldes-y-alcaldesas-asumieron-en-los-125-municipios-de-uruguay)

- [ ] Justin approval
