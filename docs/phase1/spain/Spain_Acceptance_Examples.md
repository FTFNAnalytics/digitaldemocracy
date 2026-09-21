# Spain worked acceptance examples — DRAFT

These are documentary expectations, not importer CI results. Actual source cases below precede clearly labelled isolated future CI mutations. All research locators identify retained bytes; no fixture enters the office/event/result tables.

## 1. Ordinary Madrid council; no separate direct alcalde

Source: `data/research/spain/office-register.json` pointer `/4369`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codmun.xlsx",
  "sha256": "b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741",
  "sheet": "28",
  "source_row": 82,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-440d9d23df4bf4a1f6bedb8f"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M28079-REP",
  "office_type": "municipal_council",
  "tier": "municipal",
  "next_date_id": null
}
```

LOREG article 196 documents council investiture. The register contains no ES-M28079-MAYOR. All sourced 2015/2019/2023 histories remain.

## 2. Explicit concejo abierto exception, with current-mode hold

Source: `data/research/spain/office-register.json` pointer `/5884`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codmun.xlsx",
  "sha256": "b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741",
  "sheet": "40",
  "source_row": 21,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-440d9d23df4bf4a1f6bedb8f"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M40019-REP",
  "office_type": "concejo_abierto_alcalde",
  "tier": "municipal",
  "registry_qualified": 0
}
```

Its 2023 PDF block explicitly says régimen de concejo abierto; article 179 supports the direct alcalde. No second generic council is created. Confirm mode persists in 2026 before acceptance.

## 3. Unknown institutional mode is a hold

Source: `data/research/spain/office-register.json` pointer `/51`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codmun.xlsx",
  "sha256": "b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741",
  "sheet": "02",
  "source_row": 4,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-440d9d23df4bf4a1f6bedb8f"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M02001-REP",
  "office_type": "municipal_elected_mandate_mode_pending",
  "registry_qualified": 0,
  "tier": "municipal"
}
```

Territorial existence is sourced; mode is not guessed from population, missing returns or a calendar. Future approval must resolve or explicitly retain the hold.

## 4. Formentera one combined body

Source: `data/research/spain/office-register.json` pointer `/818`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codmun.xlsx",
  "sha256": "b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741",
  "sheet": "07",
  "source_row": 30,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-440d9d23df4bf4a1f6bedb8f"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M07024-REP",
  "office_type": "combined_municipal_island_council",
  "tier": "other"
}
```

Balearic statute article 63 ties the Consell to municipal councillors. Do not add ES-I071-COUNCIL or duplicate its event merely because it serves two levels.

## 5. Special institutional mode: Asamblea de la Ciudad Autónoma de Ceuta

Source: `data/research/spain/office-register.json` pointer `/8134`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codmun.xlsx",
  "sha256": "b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741",
  "sheet": "51",
  "source_row": 4,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-440d9d23df4bf4a1f6bedb8f"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M51001-REP",
  "office_type": "autonomous_city_assembly",
  "electoral_mode": "direct_popular_assembly",
  "tier": "other"
}
```

Preserve the exact sourced body and mode. No invented popular executive, duplicate territorial body or indirect constitution date. Source origins and all holds remain in raw_json.

## 6. Special institutional mode: Parlamento de Navarra

Source: `data/research/spain/office-register.json` pointer `/8149`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/elecciones/autonomicas/index.html",
  "sha256": "4246a418e8d93ecfff33776b73e7c1ffbfd1c8a0a76c1d77785a57a5a449c3e5",
  "href": "/cs/jec/elecciones/autonomicas/navarra",
  "source_id": "spain--url-534ba11248f170fa84d90315"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-A15-PARL",
  "office_type": "autonomous_community_parliament",
  "electoral_mode": "direct_popular_assembly",
  "tier": "regional"
}
```

Preserve the exact sourced body and mode. No invented popular executive, duplicate territorial body or indirect constitution date. Source origins and all holds remain in raw_json.

## 7. Special institutional mode: Juntas Generales de Bizkaia

Source: `data/research/spain/office-register.json` pointer `/8196`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/elecciones/locales/index.html",
  "sha256": "0f20b47fa186474881133ad7c4f21806dae663c80ec2949b97ee1d74df4a7ba2",
  "href_contains": "JuntasBizkaia",
  "source_id": "spain--url-de9327bc74b8277f07ce429d"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-P48-JG",
  "office_type": "foral_general_assembly",
  "electoral_mode": "direct_popular_assembly",
  "tier": "regional"
}
```

Preserve the exact sourced body and mode. No invented popular executive, duplicate territorial body or indirect constitution date. Source origins and all holds remain in raw_json.

## 8. Special institutional mode: Cabildo Insular de Fuerteventura

Source: `data/research/spain/office-register.json` pointer `/8200`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/26codislas.xlsx",
  "sha256": "83eb6f17ce88d4de93fed0f05542e8e585cfcfc59a93e329638f5e7e16cac619",
  "sheet": "35",
  "source_row": 9,
  "source_id": "spain--url-f6d7efadca0ba329073c1c24"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-I351-COUNCIL",
  "office_type": "island_council",
  "electoral_mode": "direct_popular_island_council",
  "tier": "regional"
}
```

Preserve the exact sourced body and mode. No invented popular executive, duplicate territorial body or indirect constitution date. Source origins and all holds remain in raw_json.

## 9. Special institutional mode: Senado

Source: `data/research/spain/office-register.json` pointer `/8154`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.boe.es/buscar/act.php__da78ccf0c4",
  "sha256": "88e11c7fc2a18c909d5cff653a1788b893452fd1b2b60c7fdf2c65f02a45c114",
  "html_anchor": "a69",
  "source_id": "spain--url-d8fa883c90068a0b52f75771"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-SENADO",
  "office_type": "national_upper_chamber",
  "electoral_mode": "mixed_popular_and_autonomous_designation",
  "tier": "national"
}
```

Preserve the exact sourced body and mode. No invented popular executive, duplicate territorial body or indirect constitution date. Source origins and all holds remain in raw_json.

## 10. Historical office and actual 2015 event retained

Source: `data/research/spain/office-register.json` pointer `/5296`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/codmun15/15codmun.xls",
  "sha256": "706aa43482cdaa77fb9b9debccd1d972b629e4d4a79126ca5c686375a6aca494",
  "sheet": "dic15",
  "source_row": 5286,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-d8f63979606f84d05059b384"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M36011-REP",
  "office_status": "historical",
  "existing_event_id": "event-69db991cb44915f29a687a4c",
  "effective_to_label": null
}
```

Cerdedo is present in old INE snapshots and absent from current register. Keep its 2015 source event; do not invent a dissolution date or successor edge.

## 11. Historical office without transcribed results still exists

Source: `data/research/spain/office-register.json` pointer `/2151`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.ine.es/daco/daco42/codmun/codmun11/11codmun.xls",
  "sha256": "875119fcdcbbb3c16e14a2b0cf6aacd3399a987b270d3ca4421166f4adc05a96",
  "sheet": "dic11",
  "source_row": 2148,
  "column": "CPRO,CMUN,NOMBRE",
  "source_id": "spain--url-0aa34e679515b010f62660a5"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "office_id": "ES-M15026-REP",
  "office_status": "historical",
  "numeric_result_rows": 0
}
```

Cesuras old territorial code is preserved. Missing numeric history does not mean no election or zero votes.

## 12. Printed zero votes remain zero

Source: `data/research/spain/results.json` pointer `/12`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/documentos/Alicante-Avila_BOE-A-2023-16886.pdf",
  "sha256": "c72aabc55f88f537b3016c1ed356dbf0ad99b66d8a3e0f86cf3aa7cdb9d3e1c0",
  "page": 2,
  "block": 2,
  "bbox": [
    35,
    280.701,
    565,
    787
  ],
  "source_y": 569.231,
  "source_row": 10,
  "source_id": "spain--url-f750ccbb9f073a6a838b6215"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "result_row_id": "result-53530b36178e204d4415ba53",
  "votes": 0,
  "votes_status": "zero",
  "seats": null,
  "seats_status": "unknown"
}
```

The exact printed 0 is not NULL. Blank seat field remains unknown. Do not assign a denominator or elected status.

## 13. Blank seats and unknown shares are not zero

Source: `data/research/spain/results.json` pointer `/8`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/documentos/Alicante-Avila_BOE-A-2023-16886.pdf",
  "sha256": "c72aabc55f88f537b3016c1ed356dbf0ad99b66d8a3e0f86cf3aa7cdb9d3e1c0",
  "page": 2,
  "block": 2,
  "bbox": [
    35,
    280.701,
    565,
    787
  ],
  "source_y": 486.871,
  "source_row": 6,
  "source_id": "spain--url-f750ccbb9f073a6a838b6215"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "result_row_id": "result-3da451cd107262cf230b8d6a",
  "votes": 26,
  "seats": null,
  "seats_status": "unknown",
  "share": null,
  "share_status": "unknown"
}
```

No numeric share or missing seat value is inferred from votes or winning status.

## 14. Explicit zero seats remain distinct from a blank

Source: `data/research/spain/results.json` pointer `/47622`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/documentos/Locales_2015_Resultados.pdf",
  "sha256": "87460195c711d4e5c74b8cef95ed1ce5a23a540486f1fe8903b21939b386a9ac",
  "page": 4,
  "block": 2,
  "bbox": [
    35,
    246.633,
    565,
    442.166
  ],
  "source_y": 357.78,
  "source_row": 5,
  "source_id": "spain--url-ed68ee012aa7b4dccd5cc7ce"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "result_row_id": "result-46c1a3115ad3e0c5e5456b75",
  "seats": 0,
  "seats_status": "zero",
  "votes": 2461
}
```

Preserve the source 0 and original cell/row location; compare the previous blank-seat example.

## 15. Day precision does not imply reconciled certification

Source: `data/research/spain/events.json` pointer `/20740`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/elecciones/generales/index.html",
  "sha256": "3b98f8c044b8014d4294f81cadffa443cad607e17a1d4d1b4d8fe5ce5db0460b",
  "html_anchor_index": 21,
  "href": "/cs/jec/elecciones/Generales-julio2023?p=1379061494717",
  "source_id": "spain--url-7561592079082da51e6c2421"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "event_id": "event-34d4058be286b79c2466c6bb",
  "date": {
    "label": "2023-07-23",
    "precision": "day",
    "certainty": "called",
    "year": 2023,
    "month": 7,
    "day": 23
  },
  "legal_outcome": "unknown"
}
```

The actual election date has day precision/called certainty. Original/corrective result publications still require reconciliation; do not label certified from date precision.

## 16. National total once; no province double-count

Source: `data/research/spain/results.json` pointer `/91379`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/documentos/resultados_UE_280624.pdf",
  "sha256": "168ce1de64230269ccf1ec858ebe4635b4d3d64994c05022ba1d02ece70cc6fa",
  "page": 6,
  "table": 1,
  "row": 17,
  "column": 3,
  "source_id": "spain--url-c2d0ff2fdcbd4441ee549342"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "result_row_id": "result-211efb51317b7a9baac2c3e1",
  "office_id": "ES-EP",
  "votes": 5996627,
  "seats": 22
}
```

Source locator selects the table Total estatal. Province totals elsewhere in the same PDF are not additional national rows. EP representation is proposed other.

## 17. Conflicting original blocks withheld from final-result claims

Source: `data/research/spain/events.json` pointer `/15022`. Original locator:

```json
{
  "input_path": "data/research/spain/sources/www.juntaelectoralcentral.es/cs/jec/documentos/Locales_2015_Resultados5.pdf",
  "sha256": "202bb81579759ce38ca38d017d29a452a3f462383feed7be45449f78e45b9371",
  "page": 441,
  "block": 6,
  "bbox": [
    35,
    649.795,
    565,
    787
  ],
  "source_id": "spain--url-5cd622210ff167d323a075ad"
}
```

Expected projection excerpt (all other fields follow the full map):

```json
{
  "event_id": "event-fd17680bad9dff136241f2de",
  "legal_outcome": "disputed",
  "source_claims": 2
}
```

Both nonidentical PDF blocks remain in duplicate-municipal-blocks.json. Numeric rows are disputed; no last-wins or first-wins reconciliation.

## 18. Out-of-window date does not remove office

Use actual office ES-EP and its retained 2024 event source. In an isolated future CI copy, set next metadata to a sourced test year outside 2026-09-08–2028-03-08. Assert the office and all historic events remain, while upcoming-alert eligibility is false. This is a test mutation, not a claimed collected next-election date. Current source pack has next_date=NULL.

## 19. Partial date is preserved; no January 1 invention

Isolated CI copy of the ES-CONGRESO event date: replace its label with test token 2023-07, precision=month, year=2023, month=7, day=NULL, certainty=expected; recompute only documented affected test identities/claims. Assert no fabricated day and no field silently recertified. Not an actual Spain research claim.

## 20. Unchanged re-import

Read Spain_Input_Inventory.json /hash_inputs, recompute H = 850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17. Two future attempts must have different runtime IDs but same candidate release `country-package-spain--sha256-850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17`. No attempt exists from this documentation task.

## 21. Corrected import with guarded original

Change a copied effective source/override descriptor under a reviewed correction; old entity IDs and original claims remain. Changed hash inputs must yield a new R. A correction cannot silently rename/reorder national party labels or municipal source ordinals.

## 22. Incomplete refresh is not deletion

Omit actual ES-M28079-REP from a future incoming partial copy. Carry the prior office/events/results and their source hashes into the effective input set, or fail closed. Do not DELETE or treat missing as withdrawal.

## 23. Resolved source FK versus unresolved citation

Use the actual source_id in the printed-zero example. Removing that known S row must fail closed; it cannot be rewritten as unresolved to pass. Separately, an actual unresolvable token retained in a future source may create unresolved_evidence against a real typed locator with original token/reason and no fabricated source FK.

## 24. Poison rollback and unrelated lineages

In an isolated future staging DB, poison the result event FK from the Madrid source case. Entire Spain candidate fails, separate attempt ledger retains failure and previous publication set—including LatAm/NZ and every other Europe lineage—keeps serving unchanged. Execution Not run.

## 25. Fixture exclusion

Isolated validation mutation: copy a real office and replace its ID with FIX-SPAIN-TEST, or insert FXT token in semantic evidence identities. Production-import validation must reject it; no fixture is present in this delivered data.

## 26. Regional register count versus approved calendar

There are 68 proposed regional offices from institutional/geography evidence. All tiers are draft→needs_review and all next dates unknown; approved dated regional-calendar numerator remains zero. Zero is honest and must not fail structural package validation.

## 27. No fabricated proceedings or percent vectors

Proceeding and party_mapping tables are empty by policy. Municipal original/correction PDFs are retained evidence, not new ordinary cycles. Every Rr.share is NULL/unknown; no division of candidate marks by turnout or silent row dropping.

## 28. Submunicipal source is not a municipal duplicate

Read unbound-municipal-blocks.json: 6,708 explicit submunicipal blocks and 158 unmatched municipal-name bindings. Keep them as retained research claims; neither synthesize office IDs nor fuzzy-merge them into a nearby INE municipality.
