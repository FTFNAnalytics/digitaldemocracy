# Poland acceptance examples — Prompt AC

Draft. Concrete source projections below were documented and artifact-validated; operational fault injections/re-imports are explicitly **Not run**. O/E/R/P use the field-map legend. Results can be found by exact ID in the complete JSONL/vectors.

## 1. Council and popular executive are separate

O `/0` → {"office_id": "PL-020101-C", "office_type": "municipal_council", "office_status": "current", "geography_id": "PL-020101", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_rady_gmin.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_rady_gmin_utf8.csv"},"sha256":"849409868eb2ba4c19bbccec62061ed3dc482f7e924220baa1ba8280fcb774f9"}`.

O `/2477` → {"office_id": "PL-020101-X", "office_type": "direct_municipal_executive", "office_status": "current", "geography_id": "PL-020101", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_wojt_burmistrz_prezydent.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_wojt_burmistrz_prezydent_utf8.csv"},"sha256":"ed620f6cac11fb539cf2a9051d2295a8f9f7c509b394ef17c0f25066c51ec820"}`. Expected two office rows, shared geography; no council-selected mayor assumption.

## 2. City with county rights is one council

O `/1280` → {"office_id": "PL-146501-C", "office_type": "municipal_council", "office_status": "current", "geography_id": "PL-146501", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_rady_gmin.zip","json_pointer":null,"locator":{"row":17537,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_rady_gmin_utf8.csv"},"sha256":"849409868eb2ba4c19bbccec62061ed3dc482f7e924220baa1ba8280fcb774f9"}`. GUS reconciliation city_county_codes includes146500. Expected one Warsaw city council and one executive, no PL-146500-P.

## 3. Warsaw districts are separately evidenced

O `/5288` → {"office_id": "PL-146502-D", "office_type": "warsaw_district_council", "office_status": "current", "geography_id": "PL-146502", "proposed_tier": "other"}. Source: `{"input_path":"data/research/poland/sources/2024-kandydaci_rady_dzielnic.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"kandydaci_rady_dzielnic_utf8.csv"},"sha256":"52117cc773da01d33bfbb4dea0f29557be7698cd300468faa1414e05ecab8b5f"}`. Expected proposed other; this does not authorize invented district mayors or nationwide sołectwo rows.

## 4. Sejmik versus powiat category

O `/5268` → {"office_id": "PL-020000-V", "office_type": "voivodeship_sejmik", "office_status": "current", "geography_id": "PL-020000", "proposed_tier": "regional"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_sejmiki_wojewodztw.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_sejmiki_wojewodztw_utf8.csv"},"sha256":"852b772cf5513ebcca121e6447af9f36bca87fedb16e3f100fbb05e97d778f0d"}`.

O `/4954` → {"office_id": "PL-020100-P", "office_type": "county_council", "office_status": "current", "geography_id": "PL-020100", "proposed_tier": "regional"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_rady_powiatow.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_rady_powiatow_utf8.csv"},"sha256":"41a2860551149646b64f1e03528a37fd13e6b6db1e63ce4424f1a00bda4176c5"}`. Both proposed regional, but powiat tier retains focused review; office_type never conflates them.

## 5. Out-of-window office retained

O `/0` → {"office_id": "PL-020101-C", "office_type": "municipal_council", "office_status": "current", "geography_id": "PL-020101", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/2024-okregi_rady_gmin.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"okregi_rady_gmin_utf8.csv"},"sha256":"849409868eb2ba4c19bbccec62061ed3dc482f7e924220baa1ba8280fcb774f9"}`. O next_election={value:2029,precision:year,certainty:expected}; source pkw-recent.html term2024–2029. Expected year2029 research_date, no month/day and no invented ordinary event. Office remains present outside the alert window.

## 6. Historic-only office retained

O `/5310` → {"office_id": "PL-320304-C", "office_type": "municipal_council", "office_status": "historical", "geography_id": "PL-320304", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/2014-council-candidates.xlsx","json_pointer":null,"locator":{"row":223871,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"kandydaci OK","zip_member":null},"sha256":"9bc8af91e4853b004e788ee1ba303f7549bb613bbdba7db72b9858ab12d395ae"}`. GUS bdl-unit-023216403042.json /description explicitly abolishes Ostrowice on2019-01-01. Expected historical+active, preserved2014 returns, successor NULL.

## 7. New gmina requires real elected-body evidence

O `/5284` → {"office_id": "PL-120713-X", "office_type": "direct_municipal_executive", "office_status": "current", "geography_id": "PL-120713", "proposed_tier": "municipal"}. Source: `{"input_path":"data/research/poland/sources/wojtburmistrz-list.bin","json_pointer":null,"locator":{"decoded_json_pointer":"/10","decoded_path":"data/research/poland/wojtburmistrz-index-extract.json","id":3937,"protobuf_type":"ListaUzupelniajacych","wybory_index":10},"sha256":"e3de4a280cb3f3b4c75bfc90e83db40ae88a2c24015952c868e66b07ae696aec"}`.

E `/367` is the supplied2025-03-16 Szczawa council call. Expected no fabricated2024 election or zero-filled2025 result.

## 8. Runoff is a proceeding, not an extra cycle

R `result_row_id=result-1a9b82443fbc0174fa3485e4` → {"history_key":"PL-020201-X::2014::ordinary::whole-office","office_id":"PL-020201-X","proceeding_id":"proceeding-6d19cda6264aa5e9f8ac152d","result_row_id":"result-1a9b82443fbc0174fa3485e4","seats":null,"seats_status":"unknown","share":48.5202492211838,"share_status":"recorded","votes":4361,"votes_status":"recorded"}. Exact source: `{"input_path":"data/research/poland/sources/2014-executive-candidates.xls","json_pointer":null,"locator":{"row":20,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"kand WBP","zip_member":null},"sha256":"a9246a0b5d28bf42382e6e0dc961e55557f23022585aa6a500a5f55a7197906e"}`. Expected first_round and runoff P rows under one HK; first-round evidence remains. No duplicate ordinary event.

## 9. Missing votes are not zero

R `result_row_id=result-f7a6699add9edb75e0d6be89` → {"history_key":"PL-020102-C::2018::ordinary::whole-office","office_id":"PL-020102-C","proceeding_id":null,"result_row_id":"result-f7a6699add9edb75e0d6be89","seats":null,"seats_status":"unknown","share":null,"share_status":"unknown","votes":null,"votes_status":"unknown"}. Exact source: `{"input_path":"data/research/poland/sources/2018-2018-wyniki-wyborów-do-rad.zip","json_pointer":null,"locator":{"row":879,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"2018-kand-rady","zip_member":"2018-kand-rady.xlsx"},"sha256":"49c0a7fd8bfc2ff0a5b3f0a09e0a378b55ae0646eaa7e450c06b9ceb5cd878bf"}`. Expected NULL/unknown exactly; source registration/return cells remain raw.

## 10. Reported zero survives

R `result_row_id=result-ca3363df1543b52cdabaa291` → {"history_key":"PL-020102-C::2014::ordinary::whole-office","office_id":"PL-020102-C","proceeding_id":null,"result_row_id":"result-ca3363df1543b52cdabaa291","seats":null,"seats_status":"unknown","share":null,"share_status":"unknown","votes":0,"votes_status":"zero"}. Exact source: `{"input_path":"data/research/poland/sources/2014-council-candidates.xlsx","json_pointer":null,"locator":{"row":879,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"kandydaci OK","zip_member":null},"sha256":"9bc8af91e4853b004e788ee1ba303f7549bb613bbdba7db72b9858ab12d395ae"}`. Expected integer0 and votes_status=zero; never replace with NULL or assume no election occurred.

## 11. Blank mandate versus explicit non-award

R `result_row_id=result-ca3363df1543b52cdabaa291` → {"history_key":"PL-020102-C::2014::ordinary::whole-office","office_id":"PL-020102-C","proceeding_id":null,"result_row_id":"result-ca3363df1543b52cdabaa291","seats":null,"seats_status":"unknown","share":null,"share_status":"unknown","votes":0,"votes_status":"zero"}. Exact source: `{"input_path":"data/research/poland/sources/2014-council-candidates.xlsx","json_pointer":null,"locator":{"row":879,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"kandydaci OK","zip_member":null},"sha256":"9bc8af91e4853b004e788ee1ba303f7549bb613bbdba7db72b9858ab12d395ae"}`.

R `result_row_id=result-80c59c5d5f02cc20d5ede6e3` → {"history_key":"PL-020000-V::2014::ordinary::whole-office","office_id":"PL-020000-V","proceeding_id":null,"result_row_id":"result-80c59c5d5f02cc20d5ede6e3","seats":0,"seats_status":"zero","share":null,"share_status":"unknown","votes":3060,"votes_status":"recorded"}. Exact source: `{"input_path":"data/research/poland/sources/2014-council-candidates.xlsx","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":"kandydaci OK","zip_member":null},"sha256":"9bc8af91e4853b004e788ee1ba303f7549bb613bbdba7db72b9858ab12d395ae"}`. Expected blank→NULL and explicit N/Nie→0; do not infer winner/loser from vote rank.

## 12. Fraction-labelled share remains a named hold

R `result_row_id=result-c41bc7985447b55121078a17` → {"history_key":"PL-SEJM::2019::ordinary::whole-office","office_id":"PL-SEJM","proceeding_id":null,"result_row_id":"result-c41bc7985447b55121078a17","seats":1,"seats_status":"recorded","share":null,"share_status":"unknown","votes":7694,"votes_status":"recorded"}. Exact source: `{"input_path":"data/research/poland/sources/sejmsenat2019-kandydaci_sejm.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"kandydaci_sejm.csv"},"sha256":"b2aa164f57d52345fa248e1526c5b9a9f09dab89c7fd63d7b6ff03d3c91f6e30"}`. Raw source percentage lexeme survives. Expected typed share=NULL/unknown pending unit evidence; neither ×100 nor raw0.x-as-percent is silently chosen.

## 13. Partial historic date remains partial

E `/16756` → `{"date":{"certainty":"called","precision":"year","value":"2019"},"event_id":"event-8cc48ba073842d49ba0ee7da","history_key":"PL-SEJM::2019::ordinary::whole-office","office_id":"PL-SEJM"}`. Source `{"input_path":"data/research/poland/sources/sejmsenat2019-kandydaci_sejm.zip","json_pointer":null,"locator":{"row":2,"row_numbering":"1-based physical CSV record or spreadsheet row; header included","sheet":null,"zip_member":"kandydaci_sejm.csv"},"sha256":"b2aa164f57d52345fa248e1526c5b9a9f09dab89c7fd63d7b6ff03d3c91f6e30"}`. Expected year precision, month/day=NULL; no January1 invention.

## 14. Precise local polling date survives

local2024-config.bin /Konfiguracja.timerVotingStartTs(field13)=1712466000 →2024-04-07; secondRound.field13→2024-04-21. Expected day precision on event claim and separate raw proceeding date. Source-cycle HK remains2024; no identity churn from date enrichment.

## 15. President is elected; voivode/PM are absent

O `/5308` → {"office_id": "PL-PRESIDENT", "office_type": "direct_national_executive", "office_status": "current", "geography_id": "PL", "proposed_tier": "national"}. Source: `{"input_path":"data/research/poland/sources/prezydent2025-kandydaci-indexed.zip","json_pointer":null,"locator":"Official PKW whole-country candidate return; constituencies retained as result scope, not extra chamber offices","sha256":"42c11c3be40e5c5d6a4347e7dc7029932b1535121cd31a017e9137d422e4600b"}`. Expected one national direct executive with supplied2020/2025 returns; no invented popular voivode, cabinet or PM contest.

## 16. EP constituency vectors are not national shares

O `/5309` → {"office_id": "PL-EP", "office_type": "european_parliament_delegation", "office_status": "current", "geography_id": "PL", "proposed_tier": "other"}. Source: `{"input_path":"data/research/poland/sources/pe2024-kandydaci-indexed.zip","json_pointer":null,"locator":"Official PKW whole-country candidate return; constituencies retained as result scope, not extra chamber offices","sha256":"8360a48143bc2190c6ba73daa73e4707bb03ad3ac61c9dc14aa89598eccae7f4"}`. pe2024-kandydaci-indexed.zip member kandydaci_utf8.csv record2 contains source candidate votes/share in constituency1. Expected one EP event/body with separate raw constituency scopes; never sum percentage columns across constituencies.

## 17. Unchanged re-import fingerprint

Inventory /hash_inputs hashes to `186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944`, candidate release `country-package-poland--sha256-186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944`. Isolated future importer specification: two runs of these exact accepted effective bytes create distinct attempt_ids and the same R; these runs were Not run.

## 18. Corrected import preserves unaffected identities

Isolated future CI mutation anchored on PL-020101-C: a separately accepted source correction changes effective hash and lineage release; same office ID/HK and unrelated result IDs stay unchanged. Preserve original claims. No correction is accepted or applied here.

## 19. Poison FK fails closed

Isolated future CI mutation of the real result result-ca3363df1543b52cdabaa291: replace a resolved source FK with a nonexistent source key. Expected transaction/staging failure, durable failed attempt, last good publication and all other lineages unchanged. Not run.

## 20. Unresolved evidence is not a broken FK

U /3 PL-2019-SHARE-UNIT targets the real Poland country locator. Expected unresolved_evidence token with explicit reason, no fabricated URL/source FK. Real source claims remain attached; this differs from the poison fixture.

## 21. Incomplete refresh is not deletion

Isolated future CI omission of PL-320304-C and PL-120713-X: carry both records and supporting inputs forward or fail pending explicit disposition. Never drop historical or out-of-window offices. Not run.

## 22. Fixture exclusion and publication coexistence

Isolated future CI fixture FIX-PL-020101-C must reject from production counts. Poland-only refresh preserves exact LatAm/NZ/other Europe release members and citations. No /electiondatabase redirect or UI mutation. Not run.
