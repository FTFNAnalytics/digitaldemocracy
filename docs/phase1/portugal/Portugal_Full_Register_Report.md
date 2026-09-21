# Portugal full-register report — Prompt AD

**Draft for Justin.** Main pinned at `785bae49b4b3ac6bc2ef105f33cc826caa948caf`. This is new sourced research; no repository, importer, SQLite, VPS or UI changes were made.

The captured CNE 2025 register covers **308 municípios and 3,258 freguesias**, including **37 citizens-plenary parishes**. It supports **10,666 current body/mandate records** and **8,168 held historical records**: **18,834 total**. Historical records include unresolved same-unit code/name variants; **8,168 is not a count of proven abolished offices**. The pack contains **19,820 ballot-context events, 66,283 result rows and two presidential proceedings**. Eight spreadsheet rows without candidate returns remain unresolved evidence, with their offices retained.

| Current scope | Records | Proposed tier | Electoral treatment |
|---|---:|---|---|
| Municipal assemblies | 308 | municipal | Elected component; ex-officio parish heads are not extra votes |
| Câmaras municipais | 308 | municipal | Directly elected collegiate executives |
| Presidentes da câmara | 308 | municipal | Winning CM-list head; no separate mayoral ballot |
| Parish assemblies | 3,221 | other | Direct lists; 37 plenary jurisdictions have no current AF |
| Juntas de freguesia | 3,258 | other | AF elects other members; plenary exception documented |
| Parish presidents | 3,258 | other | Winning AF-list head or plenary mechanism |
| Parliament + President of the Republic | 2 | national | Parliamentary list / direct presidential ballot |
| Açores + Madeira legislatures | 2 | regional | Separate autonomous regional parliaments |
| EP delegation | 1 | other | Portugal list returns |

**Tier totals, all records:** municipal **927**; regional **2**; national **2**; other **17,903**. Current-only totals are municipal 924, regional 2, national 2 and other 9,738. All classifications remain drafts.

**Executives versus assemblies:** one standalone popular national presidency; 308 municipal president mandates and 3,258 parish president mandates linked to their actual electoral mechanisms. There are **zero additional independent municipal mayoral ballots**. The 308 CM bodies and 3,258 JF bodies remain distinct from their heads. Assemblies/delegation records total 3,533 current rows. Regional government presidents are appointed by the Representative of the Republic, considering election results; no popular regional executive contest is fabricated.

**Historic depth:** five local cycles (2009–2025; 19,653 return contexts); seven parliamentary cycles (2009–2025; 154 constituency contexts); presidential elections in 2016, 2021 and 2026; Açores in 2016, 2020 and 2024; Madeira in 2023, 2024 and 2025; EP in 2009, 2014, 2019 and 2024. The two 2026 presidential rounds belong to one event. Votes stay on the original ballot body and are not copied onto linked heads or juntas. No margins, winners or seat allocations are calculated. Supplied seats and percentages are preserved; older EP share/seat details remain retained inputs pending binding.

**Open gates:** historical parish identities and the 2013/2025 reforms; parish-tier policy; post-register changes; plenary minutes and special elections; source-code anomalies; three published aggregate discrepancies; omitted votes disclosed in the 2026 presidential runoff map; Açores compensation/rejected-candidature issues; Madeira's 2023 correction; earlier history and older EP details. Exact affected IDs and source locators accompany the pack. Local dates retain year precision pending a repeat-election audit. All next-election dates remain unknown; the alert window never removes offices or history.

Primary anchors: [CNE 2025 local register and maps](https://www.cne.pt/content/eleicoes-autarquicas-2025), [CNE election archive](https://www.cne.pt/content/eleicoes-referendos), [CNE local electoral mechanisms](https://www.cne.pt/faq2/96/5), and the [Portuguese Constitution](https://www.parlamento.pt/Legislacao/Paginas/ConstituicaoRepublicaPortuguesa.aspx). Exact sources and archive members are retained with hashes. Partial MAI retrieval does not supply invented zeros.

- [ ] Justin accepts the scope and body/mandate model.
- [ ] Justin accepts or amends draft tiers and historical identity policy.
- [ ] Justin accepts handling of each numerical and research hold.

The pack includes a 223-column field map, complete identity vectors, 23 worked examples and a read-only validator. **Importer/publication CI: Not run.** `research_coverage_complete=false`; `applied_changes=0`.
