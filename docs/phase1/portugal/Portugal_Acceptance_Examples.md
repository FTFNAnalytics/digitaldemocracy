# Portugal worked acceptance examples — Prompt AD

Real IDs and primary locators below; future mutations explicitly labelled. All importer/SQLite/publication execution **Not run**. These examples describe expected behavior, not successful production tests.

## 1. Águeda assembly, Câmara and president are distinct mandates; one CM ballot

real source/documentary example. All three sourced mandates retained; never copy CM returns onto PCM.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/0"}`; office `PT-M0101-AM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"42"}`.
- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/1"}`; office `PT-M0101-CM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"56–57"}`.
- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/2"}`; office `PT-M0101-PCM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"56–57"}`.

Expected Atlas shape:

```json
{
  "office_ids": [
    "PT-M0101-AM",
    "PT-M0101-CM",
    "PT-M0101-PCM"
  ],
  "office_tier_classification.tier": "municipal",
  "president_raw_underlying_ballot": "PT-M0101-CM",
  "president_independent_events": 0
}
```

## 2. Aguada de Cima parish ballot and linked executive mandates

real source/documentary example. Tier is a draft submunicipal category. Vogais selection is indirect; president is list-head mechanism.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/924"}`; office `PT-F010103-AF`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_af.xlsx`; SHA256 `924ed245d4cbe12d0fd53f490975cbc19dfa48163f4d91e46c9cc2c258130ed9`; locator `{"columns":"B:H","row":4,"sheet":"AF_Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"4,21"}`.
- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/925"}`; office `PT-F010103-JF`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_af.xlsx`; SHA256 `924ed245d4cbe12d0fd53f490975cbc19dfa48163f4d91e46c9cc2c258130ed9`; locator `{"columns":"B:H","row":4,"sheet":"AF_Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"23–24"}`.
- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/926"}`; office `PT-F010103-PJF`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_af.xlsx`; SHA256 `924ed245d4cbe12d0fd53f490975cbc19dfa48163f4d91e46c9cc2c258130ed9`; locator `{"columns":"B:H","row":4,"sheet":"AF_Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"24"}`.

Expected Atlas shape:

```json
{
  "office_ids": [
    "PT-F010103-AF",
    "PT-F010103-JF",
    "PT-F010103-PJF"
  ],
  "tier": "other",
  "executive_event_policy": "AF results only; no invented separate popular junta/president contest"
}
```

## 3. Plenary parish has no zero-seat AF

real source/documentary example. Source mandate0 is structural non-applicability, not zero elected seats.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/2937"}`; office `PT-F040249-JF`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_af.xlsx`; SHA256 `924ed245d4cbe12d0fd53f490975cbc19dfa48163f4d91e46c9cc2c258130ed9`; locator `{"columns":"B:H","row":675,"sheet":"AF_Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"23–24"}`.

Expected Atlas shape:

```json
{
  "office_id": "PT-F040249-JF",
  "excluded_current_AF_id": "PT-F040249-AF",
  "current_AF_row_count": 0,
  "JF/PJF": "retained",
  "result_policy": "No plenary votes invented without minutes"
}
```

## 4. Alphanumeric parish identifier preserved

real source/documentary example. No integer conversion of sourceDTMNFR; leading0 and letters survive.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/1902"}`; office `PT-F0302FA-AF`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_af.xlsx`; SHA256 `924ed245d4cbe12d0fd53f490975cbc19dfa48163f4d91e46c9cc2c258130ed9`; locator `{"columns":"B:H","row":330,"sheet":"AF_Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"4,21"}`.

Expected Atlas shape:

```json
{
  "office_id": "PT-F0302FA-AF",
  "geography_id": "PT-F0302FA",
  "id_namespace": "cdd-observatory-v1"
}
```

## 5. Açores and Madeira are two regional legislatures

real source/documentary example. Source constitutional mechanism supplies no popular regional-government-president office; no calendar-derived tier.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/18832"}`; office `PT-AC-AL`.
  Primary: `data/research/portugal/sources/www.parlamento.pt/Legislacao/Paginas/ConstituicaoRepublicaPortuguesa.aspx`; SHA256 `d29d427a75404f65863c17054775a37c5bdad0828c68c9a53cd58c5bf05bc636`; locator `{"article":"231"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2024_alraa/docs_geral/2024_alraa_mapa_oficial_resultados.pdf`; SHA256 `2aa8162a88ba484a316769a1a54782e6a9b8ac168ff185be9df90ba0c14cb826`; locator `{"table":"Mapa oficial / Total column"}`.
- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/18833"}`; office `PT-MA-AL`.
  Primary: `data/research/portugal/sources/www.parlamento.pt/Legislacao/Paginas/ConstituicaoRepublicaPortuguesa.aspx`; SHA256 `d29d427a75404f65863c17054775a37c5bdad0828c68c9a53cd58c5bf05bc636`; locator `{"article":"231"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_alram/docs_geral/2025_alram_mapa_oficial_dre.pdf`; SHA256 `d837ab5ebd0084aaaa7a6b0cd74d0ab41318e51949b9e239415447e744d0e336`; locator `{"pdf_page":1,"table":"official result map"}`.

Expected Atlas shape:

```json
{
  "office_ids": [
    "PT-AC-AL",
    "PT-MA-AL"
  ],
  "tier": "regional",
  "direct_regional_president_offices": 0
}
```

## 6. Presidential two rounds, one cycle

real source/documentary example. Result FK includes the correct proceeding; first round stays retained.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/19810"}`; office `PT-PR`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2026_pr/docs_geral/2026_pr_1-sufragio_mapa_oficial_dr.pdf`; SHA256 `e042e8fe100edf7619722803380c1d294aaf732a316df0df86ed249054b196b8`; locator `{"pdf_page":1,"table":"official result map"}`.
- Documentary locator: `data/research/portugal/proceedings.json` `{"json_pointer":"/0"}`; office `PT-PR`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2026_pr/docs_geral/2026_pr_1-sufragio_mapa_oficial_dr.pdf`; SHA256 `e042e8fe100edf7619722803380c1d294aaf732a316df0df86ed249054b196b8`; locator `{"pdf_page":1}`.
- Documentary locator: `data/research/portugal/proceedings.json` `{"json_pointer":"/1"}`; office `PT-PR`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2026_pr/docs_geral/2026_pr_2-sufragio_mapa_oficial_dr.pdf`; SHA256 `7db2906840fa00b2d223ab043080691c8fd88bce01643b74979fe21b3422a456`; locator `{"pdf_page":1}`.

Expected Atlas shape:

```json
{
  "election_event_rows": 1,
  "history_key": "PT-PR::PR:2026",
  "proceeding_rows": 2,
  "kinds": [
    "first_round",
    "runoff"
  ],
  "dates": [
    "2026-01-18",
    "2026-02-08"
  ]
}
```

## 7. Historic-only source-era office survives current roster absence

real source/documentary example. Do not present unresolved alias as proven abolition; retain historical rows and source IDs.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/10661"}`; office `PT-F010121-H0365538da192-AF`.
  Primary: `data/research/portugal/retained-archive-members/2021al_mapa_oficial/mapa_1_resultados.xlsx`; SHA256 `3319274f72c24a10aefe7bd00b07c3775ef7b72e560ff3f78e49cfa01083f407`; locator `{"columns":"1:41","row":12,"sheet":"mapa_I"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"21–24"}`.
- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/3843"}`; office `PT-F010121-H0365538da192-AF`.
  Primary: `data/research/portugal/retained-archive-members/2021al_mapa_oficial/mapa_1_resultados.xlsx`; SHA256 `3319274f72c24a10aefe7bd00b07c3775ef7b72e560ff3f78e49cfa01083f407`; locator `{"columns":"1:41","row":12,"sheet":"mapa_I"}`.

Expected Atlas shape:

```json
{
  "office_id": "PT-F010121-H0365538da192-AF",
  "office_status": "historical",
  "registry_qualified": 0,
  "record_state": "active",
  "successor_id": null
}
```

## 8. Unknown/out-of-window next election never drops a current office

real source/documentary example. Alert-window query can returnempty while office remains. Ordinary cadence is not a called2029 date.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/0"}`; office `PT-M0101-AM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"42"}`.

Expected Atlas shape:

```json
{
  "next_date_id": null,
  "next_date_resolution": "unknown",
  "office_retained": true,
  "prospective_events_added": 0
}
```

## 9. Explicit zero seats survives

real source/documentary example. 0/zero cannot become missing. No winner inferred.

- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":1}`; office `PT-M0101-CM`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_1_resultados_retificado.xlsx`; SHA256 `fd54cc1a1bb41e82c39921c616ba2e930678c722d7aa677619f00aa752efb43e`; locator `{"column":10,"row":6,"sheet":"Folha1"}`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_2_perc_mandatos_retificado.xlsx`; SHA256 `49fee2e3ee1142a42e8a7dc80bc5e30fbc58e372a5daeec6fd83c7ae6ae3cfde`; locator `{"row":7,"seats_column":8,"share_column":7,"sheet":"Folha1"}`.

Expected Atlas shape:

```json
{
  "result_row_id": "result-6c5434159e653d1db843d14b",
  "votes": 175,
  "votes_status": "recorded",
  "seats": 0,
  "seats_status": "zero"
}
```

## 10. Missing seat cell remains unknown

real source/documentary example. Blank/dash cannot become numericzero; source raw token retained.

- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":11442}`; office `PT-M1811-AM`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_1_resultados_retificado.xlsx`; SHA256 `fd54cc1a1bb41e82c39921c616ba2e930678c722d7aa677619f00aa752efb43e`; locator `{"column":26,"row":3436,"sheet":"Folha1"}`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_2_perc_mandatos_retificado.xlsx`; SHA256 `49fee2e3ee1142a42e8a7dc80bc5e30fbc58e372a5daeec6fd83c7ae6ae3cfde`; locator `{"row":3437,"seats_column":40,"share_column":39,"sheet":"Folha1"}`.

Expected Atlas shape:

```json
{
  "result_row_id": "result-8563b95ea762c9a0d89033d9",
  "votes": 2496,
  "seats": null,
  "seats_status": "unknown",
  "share": null,
  "share_status": "unknown"
}
```

## 11. Local date precision remains year only

real source/documentary example. No general polling day copied onto unreviewed local repeat context.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/14921"}`; office `PT-M0101-CM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/resultados_al2009.xls`; SHA256 `3fbd756257d3d814e68fdc790e888b219994df0076663da004b4219465d6b087`; locator `{"columns":"1:25","row":5,"sheet":"Mapa_01"}`.

Expected Atlas shape:

```json
{
  "date_id": "date-18cab72f598d6100e6b2870f7a732b740171d8d32bfa5e09a8ace87c0227c92d",
  "label": "2009",
  "precision": "year",
  "certainty": "called",
  "year": 2009,
  "month": null,
  "day": null
}
```

## 12. Missing plenary/list return is unresolved evidence

real source/documentary example. Unresolved input retains exact real source locator; no fabricated FK or zero.

- Documentary locator: `data/research/portugal/unresolved-inputs.json` `{"json_pointer":"/0"}`; office `PT-F040249-JF`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_1_resultados_retificado.xlsx`; SHA256 `fd54cc1a1bb41e82c39921c616ba2e930678c722d7aa677619f00aa752efb43e`; locator `{"columns":"1:41","row":778,"sheet":"Folha1"}`.

Expected Atlas shape:

```json
{
  "original_token": "LOCAL-2025-040249-AF-NO-RETURN",
  "office_id": "PT-F040249-JF",
  "completed_event_added": false,
  "numeric_results_added": 0
}
```

## 13. Broken resolved source FK fails closed

future CI mutation, not research. A missing resolved source cannot be relabelled unresolved to bypass integrity.

- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":1}`; office `PT-M0101-CM`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_1_resultados_retificado.xlsx`; SHA256 `fd54cc1a1bb41e82c39921c616ba2e930678c722d7aa677619f00aa752efb43e`; locator `{"column":10,"row":6,"sheet":"Folha1"}`.
  Primary: `data/research/portugal/retained-archive-members/2025al-mapa-oficial_retificado/2025al-mapa-oficial_retificado/mapa_2_perc_mandatos_retificado.xlsx`; SHA256 `49fee2e3ee1142a42e8a7dc80bc5e30fbc58e372a5daeec6fd83c7ae6ae3cfde`; locator `{"row":7,"seats_column":8,"share_column":7,"sheet":"Folha1"}`.

Expected Atlas shape:

```json
{
  "mutation": "replace existing result evidence source_id with TEST-ABSENT-SOURCE in isolated future staging",
  "expected": "failed attempt; last good release still served",
  "production_change": 0
}
```

## 14. Published aggregate discrepancy is preserved

real source/documentary example. No invented candidate, denominator repair or rescaled percentage. Justin decision remains open.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/12597"}`; office `PT-M0807-AM`.
  Primary: `data/research/portugal/retained-archive-members/al2013_mapaoficial_retif/al2013_mapaoficial_retif/Parte1_resultadosv7_retif.xls`; SHA256 `37c65295ed8c04cef3b44bb217e6ab8885f87d6a058c76b7412ab0caefc1a7fb`; locator `{"columns":"2:29","row":1391,"sheet":"Sheet1"}`.
- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":41519}`; office `PT-M0807-AM`.
  Primary: `data/research/portugal/retained-archive-members/al2013_mapaoficial_retif/al2013_mapaoficial_retif/Parte1_resultadosv7_retif.xls`; SHA256 `37c65295ed8c04cef3b44bb217e6ab8885f87d6a058c76b7412ab0caefc1a7fb`; locator `{"column":10,"row":1391,"sheet":"Sheet1"}`.
  Primary: `data/research/portugal/retained-archive-members/al2013_mapaoficial_retif/al2013_mapaoficial_retif/Parte2_perc_mandatosv7_retif.xls`; SHA256 `3fd66c292dc81357eacd3c1864448b07e95fcf20555bf138028b40b57f8e00c1`; locator `{"row":1391,"seats_column":7,"share_column":6,"sheet":"Sheet1"}`.

Expected Atlas shape:

```json
{
  "diagnostic": {
    "event_id": "event-d58b854095ca9df9208d6715",
    "year": 2013,
    "source_code": "080700",
    "organ": "AM",
    "sum_candidate_votes": 10468,
    "valid_votes_derived_for_check_only": 10258,
    "matches": false,
    "source_result_count": 7,
    "source_path": "data/research/portugal/retained-archive-members/al2013_mapaoficial_retif/al2013_mapaoficial_retif/Parte1_resultadosv7_retif.xls",
    "row": 1391
  },
  "evidence_status": "disputed",
  "replacement": null,
  "numeric_claims": "originals retained"
}
```

## 15. 2026 runoff omitted votes do not produce an invented correction

real source/documentary example. Retain publisher omission caveat and original vector; no allocation of5347 omitted votes.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/19810"}`; office `PT-PR`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2026_pr/docs_geral/2026_pr_1-sufragio_mapa_oficial_dr.pdf`; SHA256 `e042e8fe100edf7619722803380c1d294aaf732a316df0df86ed249054b196b8`; locator `{"pdf_page":1,"table":"official result map"}`.
- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":66164}`; office `PT-PR`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2026_pr/docs_geral/2026_pr_2-sufragio_mapa_oficial_dr.pdf`; SHA256 `7db2906840fa00b2d223ab043080691c8fd88bce01643b74979fe21b3422a456`; locator `{"pdf_page":1,"table_row_label":"António José Martins Seguro","text_projection_line":37}`.

Expected Atlas shape:

```json
{
  "votes": 3502613,
  "share": 66.84,
  "evidence_status": "disputed",
  "replacement": null
}
```

## 16. Açores compensation quotient is not a second vote total

real source/documentary example. Source Totalcolumn only; compensation quotient remains rawPDF evidence.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/19817"}`; office `PT-AC-AL`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2024_alraa/docs_geral/2024_alraa_mapa_oficial_resultados.pdf`; SHA256 `2aa8162a88ba484a316769a1a54782e6a9b8ac168ff185be9df90ba0c14cb826`; locator `{"table":"Mapa oficial / Total column"}`.
- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":66248}`; office `PT-AC-AL`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2024_alraa/docs_geral/2024_alraa_mapa_oficial_resultados.pdf`; SHA256 `2aa8162a88ba484a316769a1a54782e6a9b8ac168ff185be9df90ba0c14cb826`; locator `{"column":"Total","pdf_page":4,"table_row_label":"CH","text_projection_lines":[201,202,203]}`.

Expected Atlas shape:

```json
{
  "votes": 10627,
  "share": 9.51,
  "seats": 5,
  "ballot_basis": "valid_votes",
  "add_compensation_votes": false
}
```

## 17. Rejected candidature token is not a fabricated total

real source/documentary example. Four SantaMaria votes in originalrow do not authorize inventing whole-region total4.

- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":66252}`; office `PT-AC-AL`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2024_alraa/docs_geral/2024_alraa_mapa_oficial_resultados.pdf`; SHA256 `2aa8162a88ba484a316769a1a54782e6a9b8ac168ff185be9df90ba0c14cb826`; locator `{"column":"Total","pdf_page":4,"table_row_label":"MPT.ALIANÇA","text_projection_lines":[213,214,215]}`.

Expected Atlas shape:

```json
{
  "votes": null,
  "votes_status": "unknown",
  "evidence_status": "disputed",
  "raw_total_token": "c.r."
}
```

## 18. One parliament with22 constituency ballot contexts

real source/documentary example. Do not addTotalcolumn to constituentvotes or create22parliamentoffices.

- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/19785"}`; office `PT-AR`.
  Primary: `data/research/portugal/retained-archive-members/2025_ar_mapa_resultados/2025_ar_mapa_resultados.xlsx`; SHA256 `d04829b253f3b2e2baa964e59deaff45cfac7ae9a4c96410253de9db1afbd3be`; locator `{"column":3,"header_row":2,"sheet":"mapa_resultados"}`.

Expected Atlas shape:

```json
{
  "office_id": "PT-AR",
  "history_key": "PT-AR::AR:2025:C01",
  "cycle_constituency_event_count": 22,
  "national_total_extra_event": 0
}
```

## 19. Older EP votes retained without invented percentage

real source/documentary example. Originalpercentage/mandate maps remain retained; no computed share.

- Documentary locator: `data/research/portugal/results.jsonl.gz` `{"decoded_jsonl_line":66200}`; office `PT-EP`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/2019_pe_resultados_distrito.pdf`; SHA256 `cd1bedbd252471dc12464d1b2484ca266b96705951ba447afff9a1c99ddb7b5f`; locator `{"candidate_column_label":"PCTP/MRPP","candidate_column_ordinal":1,"pdf_page":1,"row_label":"Total PE2019","text_projection_line":39}`.

Expected Atlas shape:

```json
{
  "votes": 27211,
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown"
}
```

## 20. Unchanged re-import has a fresh attempt and same release

future CI protocol example. Recompute exact descriptor fingerprint. Importer not run.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/0"}`; office `PT-M0101-AM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"42"}`.

Expected Atlas shape:

```json
{
  "fingerprint_rule": "H(Portugal_Input_Inventory/hash_inputs)",
  "same_effective_inputs": "same lineage release_id",
  "new_attempt": "actual runtime UUID",
  "no_attempt_in_hash": true
}
```

## 21. Corrected accepted source changes release, not established office ID

future CI protocol example. Do not edit frozen bytes or let source-name correction silently rekey accepted entities.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/0"}`; office `PT-M0101-AM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"42"}`.

Expected Atlas shape:

```json
{
  "office_id": "PT-M0101-AM",
  "source_mutation": "new retained source version plus explicit accepted correction",
  "fingerprint": "changes",
  "original_claim": "retained",
  "applied_changes": 0
}
```

## 22. Incomplete refresh retains omitted office and history

future CI protocol example. A sparse refresh is not a legal withdrawal.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/10661"}`; office `PT-F010121-H0365538da192-AF`.
  Primary: `data/research/portugal/retained-archive-members/2021al_mapa_oficial/mapa_1_resultados.xlsx`; SHA256 `3319274f72c24a10aefe7bd00b07c3775ef7b72e560ff3f78e49cfa01083f407`; locator `{"columns":"1:41","row":12,"sheet":"mapa_I"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"21–24"}`.
- Documentary locator: `data/research/portugal/events.json` `{"json_pointer":"/3843"}`; office `PT-F010121-H0365538da192-AF`.
  Primary: `data/research/portugal/retained-archive-members/2021al_mapa_oficial/mapa_1_resultados.xlsx`; SHA256 `3319274f72c24a10aefe7bd00b07c3775ef7b72e560ff3f78e49cfa01083f407`; locator `{"columns":"1:41","row":12,"sheet":"mapa_I"}`.

Expected Atlas shape:

```json
{
  "omission": "office missing from incremental payload",
  "expected": "carry old effective rows/evidence or fail closed",
  "delete": false
}
```

## 23. Fixture rejected; unrelated lineages unchanged

future CI mutation, not research. Fixture/source-allowlist gate plus publication-set equality; no importerCI performed.

- Documentary locator: `data/research/portugal/office-register.json` `{"json_pointer":"/0"}`; office `PT-M0101-AM`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/eleicoes/2025_al/docs_geral/2025_al_mandatos_cm_am.xlsx`; SHA256 `33f3b44a504ed3d7f99082ee186b242389d6325f9e5bf07e08ba056ed73eeb50`; locator `{"columns":"B:H","row":4,"sheet":"Mandatos"}`.
  Primary: `data/research/portugal/sources/www.cne.pt/sites/default/files/dl/legis_lei_169_99_atualiz-2021.pdf`; SHA256 `31f530a7c31caad9a9e823796d9dec31277aff3afafdac55b5efdb2b335e680e`; locator `{"article":"42"}`.

Expected Atlas shape:

```json
{
  "fixture_mutation": "add synthetic source descriptor in isolated test",
  "expected": "reject staging",
  "unchanged_lineages": [
    "latin-america-fe5e91689def",
    "country-package-new-zealand",
    "country-package-albania"
  ],
  "mexico_override_changed": false
}
```

