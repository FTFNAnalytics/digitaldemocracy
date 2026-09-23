# Reproducible extraction specification

This is a source-preserving research export, not an importer. Only validate.py is shipped as executable code. It reads local files and never contacts a database, repository, server or external application.

Input decoding: UTF-8 with optional BOM for modern CSV, Windows-1252 for older text, semicolon-delimited modern files and tab-delimited older wide returns. Source CSV/XLS/XLSX/PDF/HTML bytes are retained unchanged. JSONL uses Unicode and keeps null distinct from zero.

Municipal 2026: commune files have 18 common columns then repeated 13-field list blocks; PLM has 18 plus 12; PF aggregate files lack named list results and yield metrics only. Municipal 2020: 18 common columns plus 12-field groups; preserve the candidate/list distinction and CM versus CC seat scope. Two list-name tabs at rows 1796 and 2287 of mun2020r1-5129e7cf.txt are documented in extraction-issues. Municipal 2014: 13 fields per precinct/candidate-or-list record, with a comment preamble; precinct metrics are deduplicated by office/round/commune/bureau, never multiplied by candidate rows.

National Assembly 2022: 19 common fields plus 9-field candidate blocks; 2024: 18 plus 9. Departmental 2021: 18 plus 7-field binomial groups. Regional 2021: 16 plus 9. Regional 2010: 13 plus 9; 2015: 17 plus 9 (the second-round sheet has an extra stale header label absent from the data). Presidential national workbook tables are read directly, never aggregated from incomplete territorial files.

Senate 2014/2017/2020: only the majority round-one/round-two and PR sheets, using their documented layouts and exact source status. Senate 2023: numbered candidate/list blocks, with district/BV retained. PR valid-ballot sums and majority multi-mark sums have different validation rules.

EP official HTML: national party share and constitutive-session seat table. Raw percentage string preserved; no inferred votes. The 2024 Interior regional file supplies raw vote figures only for its 18 regional reporting units. The national seat count repeated in each regional block is not normalized as regional seats.

The one-page 2022 Overseas Ministry PDF is visually transcribed from its proclaimed results. Polynesia 2013/2018/2023 shares and seats are drawn from the parliamentary report tables. WF 2022 representative names are drawn from the Assembly's official proclamation summary, with the Sigave repeat gate.

Known inconsistent source sums are preserved and documented. The validator verifies they remain exactly the observed discrepancy and fails on new/unlisted discrepancies. It does not certify the source figures or resolve judicial corrections. Some raw source files contain personal demographic columns; normalized result records deliberately use public candidate/list names and election figures, without importing birth dates or personal contact details.

Chatain (86063), 2026 round one: the official file supplies panel 1, 65 votes and 9 council seats but no list name. The empty label is preserved and documented in extraction-issues.json. No contestant identity is invented.
