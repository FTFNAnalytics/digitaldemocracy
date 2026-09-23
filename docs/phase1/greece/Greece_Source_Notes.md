# Source and extraction notes

`source-inventory.json` supplies publisher, exact original URL, retrieval time, retained path, byte count, SHA-256, evidence grade and use. It contains original HTML/JSON/JavaScript/PDF files plus one web-service text representation of the 2014 date circular; that artifact is explicitly identified and its original PDF HTTP status is not fabricated. Source hashes cover retained bytes, while `SHA256SUMS` also covers normalized artifacts and documentation.

## Authoritative source families

- The Ministry election index links the SingularLogic historical portals. For each of 1,366 local authority/cycle pairs, `stat` supplies the authority/candidate labels and council size, and `dyn` supplies full A/B vote vectors. The contemporary model/static register defines the denominator for each cycle.
- Ministry circular 83 of 20 August 2019 identifies five abolished and twelve new municipalities, with effective dates. The March 2026 Ministry distribution decision lists 332 municipalities independently of the 2023 election portal.
- Original parliamentary plenary minutes supply presidential roll-call declarations for 2000, 2005, 2010, 2014/2015, 2020 and all four 2025 ballots. Presidency biographies establish older outcomes where the complete roll calls were not recovered.
- Parliament's Greek and English historical tables provide seat-winning-party compilations. Ministry national vectors are used for 2007–2023; the 2004 complete vote vector comes from the Ministry's 2006 printed volume, PDF pages 20–21. Its four seat-winning parties reconcile to Parliament's complete allocation. Other 2004 category seats are left null rather than inferred as zero.
- European Parliament constitutive-session tables supply earlier party seats/available shares. Full Ministry EP vectors cover 2014, 2019 and 2024. The old outgoing EP table is retained only as a non-election snapshot.

## Source conflicts and scope

The old 17-row draft assigned June 2023 SYRIZA 48 seats and KKE 20. The retained Ministry snapshot and current Parliament compilation give 47 and 21 respectively, and both total 300. The rebuild uses the archived Ministry vector, including its own exact votes, and does not mix vote counts from different publication snapshots.

The English 1993 KKE vote cell contains a leading > symbol. It is preserved in `national-source-comparisons.json` with a null numerical interpretation. The selected Greek compilation independently publishes 313.001; that separately sourced number is used. The Greek 2004 page's shortened 436.81 cell is not used to create a 43,681-vote observation; the printed Ministry volume and English table agree on 436,818.

An official-hosted parliamentary magazine is editorial evidence and contains errors relative to original minutes. For 2025's third presidential ballot, the declaration in the original minutes records Tasoulas 160, Giannitsis 34, Katseli 40 and Kyriakou 14 with 52 present-abstentions; the magazine's Giannitsis 37 is not used. The original 2000 record gives Stephanopoulos 269. Older press reprints do not replace original minutes or resolve the 1975 day discrepancy. Year precision is retained where warranted.

For 2023 local councils, the archived renderer chooses positive BEdres over AEdres; adding both would overcount. For 2010/2014, the renderer sums them. For 2019, AEdres supplies the proportional council allocation. All three rules are applied only to their evidenced cycle and checked against published council size. Messini 2014 remains incomplete at 17/33, rather than being forced to balance.

13 regional 2019 source vectors contain a reporting-station/configured-station difference. This is a source-status hold, not a finding that a specific number of votes is missing. The actual reported votes are retained and reconcile to the source denominator.

## Reproducibility

JSON source fields are read directly. Legacy JavaScript literals are parsed as data; no downloaded JavaScript is executed. The offline validator rereads all local candidate vectors, numerical fields and metadata, then reconciles the represented results to the retained sources. Historical HTML cells are compared with their original lexical forms. PDF transcription locators include actual PDF page numbers; numeric presence checks supplement visual review and do not independently adjudicate every PDF table.

Reproduction requires no live endpoint. The ZIP retains the evidence needed to inspect every normalized row. Fields left unknown remain visible. National votes from competing official snapshots are not silently averaged, combined or substituted.
