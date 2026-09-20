# Denmark — full-register handoff, Prompt X

**Justin accepted 2026-09-19 (America/Edmonton): all 106 current + 240 historical draft offices (346).** New sourced research; not an import. Review pack pinned main `e64afc324e34ae07f0760f49870ece64eb2ee645`. Landing base `94b22e8`. Research captured 19 September 2026; no Denmark frozen Europe package is presumed. No importer/SQLite/VPS/UI changes. Standing policy: retain offices and historic rows even outside the ~18-month alert window.

**106 current + 240 historical office records; 1,849 historic events; 25,391 result rows.** The pack covers all 98 current municipal councils, five operating regional councils plus the elected preparatory Region Østdanmark council, Folketinget and Denmark’s European Parliament delegation. History is partial and explicitly qualified; the full Danish Realm gate remains open. Justin accepted the register universe at the drafted tiers.

| Scope | Current | Historical | History retained |
| --- | --- | --- | --- |
| Municipal councils | 98 | 226 | 1989–2001 archived; 2005–2025 current-boundary series |
| Regional councils | 6 | 0 | 29 elections; five operating + one preparatory in 2026 |
| Former county councils | 0 | 14 | 56 elections, 1989/1993/1997/2001 |
| Folketinget | 1 | 0 | 72 date anchors 1849–2026; party seats 1990–2026, votes/shares 2007–2026 |
| European Parliament—Denmark | 1 | 0 | 4 cycles 2009/2014/2019/2024; year precision; seats not mapped |


Tier totals: **municipal 324 / regional 20 / national 1 / other 1**. Current-only: municipal 98 / regional 6 / national 1 / other 1. Historical geographic names and æ/ø/å are preserved. The register contains 345 geographies; all 346 offices have 1:1 accepted classifications. 293 focused review flags cover historic bindings, regional transition and the EP tier proposal; Justin accepted the register universe. Unflagged rows are accepted without a focused-review flag — they are not a clearance of the named research gates.

**Regional transition matters:** the ministry’s regional constituting guidance and [Østdanmark council page](https://www.regionoest.dk/politik/regionsraadet) distinguish preparatory operation in 2026 from regional operation in 2027. Hovedstaden/Sjælland councils were not elected in 2025; their 2021 terms were extended through 2026. The 2025 regional seat sums are 25 Nordjylland, 31 Midtjylland, 31 Syddanmark and 47 Østdanmark; these are derived from disjoint DST elected-sex counts, not invented fixed quotas.

**Next elections do not filter offices.** The [ministry’s local-election page](https://www.valg.im.dk/valg/kommunale-og-regionale-valg) supplies 20 November 2029. It remains statutory day-precision metadata for 98 municipal and 4 continuing/successor regional councils, outside the 8 Sep 2026–8 Mar 2028 alert window. No future event is fabricated. Retiring 084/085 councils get no invented 2029 date. The captured upcoming regional numerator within the window is **0**, despite real regional offices.

## Sources and research coverage

- **Danmarks Statistik/StatBank:** original metadata and JSONSTAT responses retained with queries/hashes. VALGK3, KVRES, AKVA3 cover six cycles 2005–2025; VALGK3X/AKVA3X cover 1989–2001. Their 275 old municipal councils bind 49 same-code/name continuations and 226 distinct historic IDs. 14 county councils stay regional. No pre-reform county/country totals become municipal offices. [DST documentation](https://www.dst.dk/statistikdokumentation/c7836c78-b587-461a-96b6-af5648e390e5) explains the 2007 structural break and source system.
- **Historic rows counted once:** 1,688 municipal events + 29 regional + 56 county + 72 Folketing + 4 EP = 1,849. Results: 12,179 party + 1,546 statistical-group + 11,666 elected-candidate rows. These representations are **not additive**. EJR is the aggregate of non-reserved letters, not a party. Elected-candidate tables omit losing candidates by design.
- **National source scope:** DST national seat counts reconcile to 175 Denmark-proper seats for the sampled recent cycles; do not label them as complete 179-seat Realm results. Municipal reporting components are not separate local contests. 72 ministry date anchors remain even where typed returns have not been recovered; 1848 constituent assembly is retained as source context only.
- **Appointed/indirect offices:** [ministry constitution guidance](https://www.ism.dk/indenrigs/kommuner-og-regioners-styrelse/konstituering), municipal Q25–28, identifies council selection of the borgmester. Regional chairs and new sundhedsråd are also council-selected structures. No popular mayor/prime-minister/cabinet/chair contests authored.

## Named open gates

1. **Greenland/Faroe systems:** retain the ministry’s [Greenland](https://www.valg.im.dk/valg/valg-i-groenland) and [Faroe](https://www.valg.im.dk/valg/valg-paa-faeroeerne) source hubs. Inatsisartut/Løgting, local/settlement councils and Realm Folketing returns need separate verified code/register/result bindings. No invented offices; no claim of complete Realm coverage.
2. **2007/earlier mergers:** many-to-many successors, splits and same-code boundary changes remain reviewable. Old 707 Grenaa≠new 707 Norddjurs; old 849 Aabybro≠new 849 Jammerbugt. Bornholm 2003 and Ærø 2006 transitional contests need primary reconciliation. Same-code/name continuation is a documentary identity policy, not constant geography. Older source names are retained.
3. **KMD/KOMBIT/DST holes:** named local lists inside EJR, full losing-candidate slates, list alliances, pre 1989 local returns and special/replacement contests remain incomplete. Source cubes are retained intact.
4. **98 unresolved candidate bindings:** Nykøbing F., Neksø, and Thyborøn-Harboør spelling/abbreviation differences in 1997/2001 do not receive guessed FKs. Exact IDs/claims remain in unresolved-candidate-bindings.json and original cubes.
5. **Christiansø scope:** source explicitly identifies it outside municipalities. No dummy kommune; any separately elected island advisory institution requires scope/mode review. Referendums, civil-service, appointed and purely advisory positions are not silently turned into political offices.
6. **EP detail and disputes:** source-year precision retained; party seats/candidate histories and primary whole-event certificates remain open. Current municipal party-group sums reconcile to KVRES; this is an internal statistical check, not independent certification. No numeric override or invented margin.

## Justin decisions — 2026-09-19

- [x] Accept 346 office identities with historic-vintage qualifications (106 current + 240 historical).
- [x] Accept drafted geographic tiers for the register universe, including EP other and regional-transition handling. Keep 293 focused-review flags; do not invent clearances.
- [x] Accept documentation for future implementation while retaining named research gates.
- [ ] Authorize a future importer separately. **Not authorized in this landing.**
- [ ] Close Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, or EP-detail gates. **HOLD — research notes stay open. Do not invent Greenland/Faroe offices or fabricate merger clearances.**
