# Cyprus research gaps

The package is reviewable research with an unresolved current-register completeness gate. Missing values are not zeros.

## CY-G01 — Current community completeness

Status: **blocking**. The electoral composition table names 285 free-area community councils; the ministry branch overview says 286 free and 137 occupied. The electoral table has 138 occupied. No missing 286th free council is identifiable with sufficient certainty. The register contains 285 named councils and 285 leaders and is explicitly NOT certified complete.

Sources: `CYS-0ca1980c0c900dca`, `CYS-57321a5114b9d781`

## CY-G02 — Post-1974 electoral footprint

Status: **scope gate**. Only administered local municipalities/communities are instantiated. Nine occupied municipalities and occupied-community returns are excluded from this local register even where the Republic conducts displaced-elector elections. These are Republic returns, not TRNC institutions. TRNC offices are entirely out of scope. National House, President and EP totals retain their official electorate and are not cut down by the local geographic filter.

Sources: `CYS-117328c7d47127da`, `CYS-0096b58b33af70c3`, `CYS-0ca1980c0c900dca`

## CY-G03 — 2024 reform and predecessors

Status: **blocking for successor links**. CYSTAT municipal quarters retain previous statistical codes. This supports geography correspondence, not automatic legal succession of offices. 28 historical municipal pairs and 59 historical community pairs are source-identified. Alampra, Akoursos, Tera and Pelathousa former-office type/history were not independently established from the retained earlier election area lists; no historical office pair is fabricated for them. Gazette-level merger/abolition instruments, precise cessation dates and successor edges remain gated.

Sources: `CYS-364dcda1a09ba12a`, `CYS-117328c7d47127da`

## CY-G04 — Spilia sub-community identity

Status: **blocking for code join**. Spilia Agios Antonios and Spilia Kourdali are separate named council rows. Kourdali has no safely matched Electoral Service area ID; CYSTAT Spilia statistical territory does not justify merging the two elected councils. Kourdali retains an explicit unresolved-code identity and no invented results.

Sources: `CYS-0ca1980c0c900dca`, `CYS-364dcda1a09ba12a`

## CY-G05 — Presidential rounds and constitutional vice-presidency

Status: **coverage**. Five presidential cycles are retained: 2003 first round; both rounds in 2008, 2013, 2018 and 2023. First round requires more than half the valid ballots; a second ballot between the top two is held the following week when required. Second-round votes form a new universe, not transfers. Earlier cycles, unopposed returns and Gazette declarations are not exhaustively normalized. The constitutional Turkish-Cypriot vice-presidency does not create a current separate contested office in this pack.

Sources: `CYS-d107a7040dec541f`, `CYS-1c2fbeab45953c47`

## CY-G06 — Municipal and community executives

Status: **mechanism gate**. 20 mayors and 93 deputies have separate popular footing (91 municipal quarters plus Strovolos/Pafos). Community leaders are elected by community voters; community deputies are council-selected and are not separate popular offices. Council seat totals overlap with separately registered executives: 442 municipal councillors include deputies but exclude mayors; community member seats exclude chiefs.

Sources: `CYS-0096b58b33af70c3`, `CYS-c8c66b026fa8d701`, `CYS-eefac1e75b827a17`, `CYS-fab188a336c05828`

## CY-G07 — EP history and mandates

Status: **coverage**. Official national ballot returns cover 2004, 2009, 2014, 2019 and 2024. The EP 2024 constitutive-session party seat/share view is separate from ministry ballot counts. Earlier EP seats and individual preference outcomes are not fully normalized. A delegation office is one register row, not six invented offices.

Sources: `CYS-7d9a5b24da3c600b`, `CYS-12826bf6eebec712`

## CY-G08 — Certification, election night and corrections

Status: **blocking for certified label**. A government host or 100% count does not establish Gazette certification. Retained open-data files are labelled official returns, with certification not independently verified. The September 2026 ministry notice distinguishes provisional election-night reporting from checked records, and reports a five-ballot ELAM/EDEK correction. Do not apply that correction a second time to the released CSV.

Sources: `CYS-9ce05ca324a3b64e`, `CYS-f74a5b6e41d6f640`

## CY-G09 — Malformed 2016 community preference rows

Status: **row-level quarantine**. Three Ora candidate-preference CSV rows (471–473) contain an unquoted comma causing field displacement. They are retained in raw evidence and extraction-issues, withheld from normalized result rows. Blank elected markers elsewhere remain unknown rather than false.

Sources: `CYS-c80795d5a146998f`

## CY-G10 — Historic date precision

Status: **date gate**. House 2001 and 2006 and President 2003 retain year precision. Dataset 49 metadata incorrectly labels a 2017 date for its 2001 title. EP 2019 dataset 1056 reports 28 May; this pack keeps year precision pending poll-date corroboration. Local 2024 dataset metadata includes 9 July; the official proclamation establishes 9 June. Publication/upload dates do not become poll dates.

Sources: `CYS-651b4b97cbc64c87`, `CYS-da8b6bec46d58189`, `CYS-e025a2888ac077ae`, `CYS-e6fbeb58e8432c18`

## CY-G11 — Missing local returns / unopposed and repeat polls

Status: **coverage**. Current office existence is independent of whether a ballot return is present. The 2024 normalized local coverage has 20 municipal councils, 20 mayors, 78 deputy mayors, 194 community councils and 186 community leaders plus five DLGO presidents. Missing returns do not prove unopposed election, zero votes, abolition or appointment. By-elections, repeat polls and proclamation-only returns are not exhaustively collected.

Sources: `CYS-029ca3fa6d48f7d4`, `CYS-6a34947d57891274`, `CYS-f58bc0bd3d8ba5f1`

## CY-G12 — House electoral universes and religious representatives

Status: **scope gate**. The 2026 return confirms 56 filled legislative seats and 24 Turkish-Cypriot seats not contested. Three elected religious representatives have no plenary vote and are separate auxiliary rows. Armenian and Latin 2026 returns were unopposed: votes are null/no_poll. Maronite winner is reported but the popular totals are not normalized. Do not infer 59 voting parliamentary seats.

Sources: `CYS-8d4c6e18792d5b3e`

## CY-G13 — Statistical units versus elected councils

Status: **identity gate**. CYSTAT covers the whole island and statistical units without an active elected council. Do not instantiate every CYSTAT community. The current office register is anchored in the named Electoral Service council composition table; the workbook corroborates names/codes and geographic versions.

Sources: `CYS-364dcda1a09ba12a`, `CYS-0ca1980c0c900dca`

## CY-G14 — District organisations and service clusters

Status: **scope gate**. Five DLGO presidents have clean direct popular footing and are included as draft regional executives. Their other board members are appointed/indirect, not separate popular council contests. Thirty service-cluster boards consist of community leaders by virtue of their existing offices; no additional popular contest is invented. District state administrations are excluded.

Sources: `CYS-d3a1b2852e520036`, `CYS-0aff6c025e74db59`

## CY-G15 — Inherited contract and approval

Status: **approval gate**. The 223-column contract is inherited from the visible prior pack, not reverified against production. All classifications remain drafts; all Justin boxes are unchecked. No importer, SQLite, VPS, UI, repository or publication change is made.

Sources:
