# Extraction method

Downloaded official source bytes using their listed public URLs. Selected modern XML election/entite hierarchy at council/section, parliamentary country/constituency, and EP country levels. The 2011 communal ZIP was parsed per XML file, with result-content/listes and result-content/sections retained. Legacy HTML candidate and list tables were read with their table/row locators, excluding totals from candidate rows. Every source URL is bound to a retained hash.

No SQL, importer, site or repository program was written. validate.py is an offline research-artifact integrity checker only. The standalone research extraction procedure is described here rather than supplied as an executable ingest adapter.

Berdorf: official proclamation PDF text retrieved through web extraction; totals visually checked against rendered page. Nominative EP candidate figures (1994/1999/2004) are labelled separately. Grevenmacher 1994 LSAP block missing in upstream HTML remains missing.
